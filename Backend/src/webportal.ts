import * as bodyParser from "body-parser";
import * as cookieParser from "cookie-parser";
import * as express from "express";
import * as logger from "morgan";
import * as path from "path";
import * as jwt from "jsonwebtoken";
import * as corser from "corser";
import * as passport from "passport";
import * as passportJWT from "passport-jwt";
import errorHandler = require("errorhandler");
import methodOverride = require("method-override");
import { Electronic } from "./electronic";
import { Monitor } from "./monitor";
import { Admin } from "./admin";
import {Catalog} from "./catalog";
/**
 * The web portal.
 *
 * @class WebPortal
 */
export class WebPortal {

  public app: express.Application;
  protected catalog: Catalog;

  /**
   * Bootstrap the application.
   *
   * @class WebPortal
   * @method bootstrap
   * @static
   * @return {ng.auto.IInjectorService} Returns the newly created injector for this app.
   */
  public static bootstrap(): WebPortal {
    return new WebPortal();
  }

  /**
   * Constructor.
   *
   * @class WebPortal
   * @constructor
   */
  constructor() {
    //create expressjs application
    this.app = express();
    this.catalog = new Catalog();

    //configure application
    this.config();

    //add routes
    this.routes();

    //add api
    this.api();
  }

  /**
   * Create REST API routes
    *
   * @class WebPortal
   * @method api
   */
  public api() {
	let router: express.Router;
	router = express.Router();
	// some dummy data
	let monitor = new Monitor('1', 1, "modelNumber", "brand", 1, 1);
	let monitors = new Array(monitor, monitor, monitor);
	let token = jwt.sign({ foo: 'bar' }, 'shhhhh');
	//home page
  let routingCatalog = this.catalog;

  router.get('/', function (req, res) {
		res.send('20 dollars is 20 dollars backend home page')
	});

	router.post("/api/users/logon", function (req, res) {
        console.log(req.body);
        let body = req.body as any;
        console.log(body);

        if(body.email && body.password){
          var email = body.email;
          var password = body.password;
        }

        // usually this would be a database call:
        let user = Admin.find(email);
        if( ! user ){
          res.status(401).json({message:"no such user found"});
        }

        console.log(user);
        //add hasing.

        if(user.password === req.body.password) {
          // from now on we'll identify the user by the id and the id is the only personalized value that goes into our token
          var payload = {id: user.id};
          var token = jwt.sign(payload, 'tasmanianDevil');
          res.json({message: "ok", token: token});
        } else {
          res.status(401).json({message:"passwords did not match"});
        }
	});

	router.post("/api/users/logoff", function (req, res) {
		res.send({data: true})
	});

	router.get("/api/products/", function (req, res) {
		res.send({data: monitors})
	});

	router.post("/api/products/",function (req, res) {
		res.send({data: monitor})
	});
	
	router.get("/api/products/:id",function (req, res) {
		let electronic: Electronic;
		electronic = routingCatalog.getProduct(req.params.id);
		res.send({data: electronic});
	});

	//use router middleware
	this.app.use(router);
  }

  /**
   * Configure application
   *
   * @class WebPortal
   * @method config
   */
  public config() {
    //add static paths
    this.app.use(express.static(path.join(__dirname, "public")));

    //use logger middlware
    this.app.use(logger("dev"));

    //use json form parser middlware
    this.app.use(bodyParser.json());

    //use query string parser middlware
    this.app.use(bodyParser.urlencoded({
      extended: true
    }));

    //use cookie parser middleware
    this.app.use(cookieParser("SECRET_GOES_HERE"));

    //use override middlware
    this.app.use(methodOverride());

 
    // ## CORS middleware
    this.app.use(corser.create());

    //catch 404 and forward to error handler
    this.app.use(function(err: any, req: express.Request, res: express.Response, next: express.NextFunction) {
        err.status = 404;
        next(err);
    });
    var users = [
      {
        id: 1,
        name: 'jonathanmh',
        password: '%2yx4'
      },
      {
        id: 2,
        name: 'test',
        password: 'test'
      }
    ];
    //error handling
    this.app.use(errorHandler());

    let ExtractJwt = passportJWT.ExtractJwt;
    let JwtStrategy = passportJWT.Strategy;
    var jwtOptions = {jwtFromRequest:ExtractJwt.fromAuthHeaderAsBearerToken(),secretOrKey :'tasmanianDevil' }
    
    var strategy = new JwtStrategy(jwtOptions, function(jwt_payload, next) {
      console.log('payload received', jwt_payload);
      // usually this would be a database call:
      var user = Admin.find(jwt_payload.id);
      if (user) {
        next(null, user);
      } else {
        next(null, false);
      }
    });
    
    passport.use("passport",strategy);
    
	
}

  /**
   * Create router
   *
   * @class WebPortal
   * @method api
   */
  public routes() {
    //empty for now
  }
}