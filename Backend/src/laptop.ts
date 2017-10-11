import { ComputerSystem } from "./computersystem";
import { dbconnection } from "./dbconnection";
import { Electronic } from "./electronic";

var db = new dbconnection().getDBConnector();

export class Laptop extends ComputerSystem {
	private displaySize: number;
	private battery: number;
    private camera: boolean;
	private touchscreen: boolean;

	constructor(id: string, weight: number, modelNumber: string, brand: string,
				price: number, processor: string, ram: number, cpus: number,
				hardDrive: number, os: string, displaySize: number,
				battery: number, camera: boolean, touchscreen: boolean) {
		let electronicType = "Laptop";
		super(id, weight, modelNumber, brand, price, electronicType, processor, ram, cpus, hardDrive, os);
		this.displaySize = displaySize;
		this.battery = battery;
		this.camera = camera;
		this.touchscreen = touchscreen;
	}
 	/****************************************************************
     * Getters and Setters											*
     ****************************************************************/
	public getDisplaySize():number {return this.displaySize;}
	public getBattery():number {return this.battery;}
	public getCamera():boolean {return this.camera;}
	public getTouchscreen():boolean {return this.touchscreen;}

	public setDisplaySize(displaySize:number) {this.displaySize = displaySize;}
	public setBattery(battery:number) {this.battery = battery;}
	public setCamera(isCamera:boolean ){this.camera = isCamera;}
	public setTouchscreen(isTouchscreen:boolean) {this.touchscreen=isTouchscreen;}

	/**************************************************************
	 * Method to persist an object of type Laptop to the database *
	 **************************************************************/
	save(): boolean {
		let queryParameters = ["'"+this.getId()+"'", this.getWeight(),"'"+ this.getModelNumber() +"'",
								"'"+this.getBrand() +"'", this.getPrice(), "'"+this.processor +"'",
							   this.ram, this.cpus, this.hardDrive,
							   "'"+this.os+"'", this.getDisplaySize(), this.getBattery(),
							   this.getCamera(), this.getTouchscreen()];
		let queryText = 'INSERT INTO laptops (id,weight,modelnumber,brand,price,processor,ram,cpus,harddrive,os,displaysize,battery,camera,touchscreen)VALUES (' + queryParameters.join(',') + ');';
		db.none(queryText)
			.then(function() {
				console.log("Laptop added to db");
			})
			.catch(function(err) {
				console.log("Error adding Laptop to the db" + err);
				return false;
			});
		return true;
	}

	/***************************************************************************************
	 * Method to retrieve a persisted object from the database corresponding to a given id *
	 ***************************************************************************************/
	public static async find(id: string): Promise<Laptop> {
		let laptop: Laptop;
		console.log('SELECT * FROM laptops WHERE id =' + "'" +id + "'" + ';');
		return db.one("SELECT * FROM laptops WHERE id ='"  +id +  "';")
			.then(function(row){
				console.log("Matching object found");
				return new Laptop(row.id,row.weight,row.modelNumber,row.brand,row.price,row.processor,row.ram,row.cpus,row.hardDrive,row.os,row.displaySize,row.battery,row.camera,row.touchscreen);

			})
			.catch(function(err) {
				console.log("No matching object found" + err);
				return null;
			})
	}
	/**************************************************************
	 * Method to modify an object of type Laptop to the database *
	 **************************************************************/
	public async modify(): Promise<boolean> {
		let queryText = 'UPDATE laptops SET weight=' + this.getWeight() + ',modelNumber=' + "'"+ this.getModelNumber() + "'" + ',brand=' + "'"+ this.getBrand() + "'"
						+ ',price=' + this.getPrice() + ', processor=' + "'"+ this.processor + "'" + ',ram=' + this.ram + ',cpus=' + this.cpus 
						+ ',hardDrive=' + this.hardDrive + ',os=' + "'"+ this.os + "'" + ',displaySize=' + this.getDisplaySize() + ',battery='+ this.getBattery()
						+ ',camera=' + this.getCamera() + ',touchscreen=' +this.getTouchscreen() + ' WHERE id =' +  "'"+ this.getId() + "'";
		return db.none(queryText)
			.then(function() {
				console.log("Modified Laptop in the db");
				return true;
			})
			.catch(function(err) {
				console.log("Error modifying Laptop in the db" + err);
				return false;
			});

	}
	/**************************************************************
	 * Method to delete an object of type Laptop to the database *
	 **************************************************************/
	public async delete(): Promise<boolean> {
        return db.none("DELETE FROM laptops WHERE id ='"+ this.getId() + "';")
            .then(function () {
				console.log("Laptop object deleted in db: ");
                return true;
            }).catch(function (err) {
            console.log("No matching object found for delete: "+ err);
            return false;
        });
	}
	
	/*******************************************************
     * Method to return all laptops saved in the database
     *******************************************************/
    public static async findAll(): Promise<Electronic[]>{
        let laptops: Electronic[];
        let laptop: Laptop;
        return db.many('SELECT * FROM laptops')
            .then(function (rows) {
                return rows as Electronic[];
            }).catch(function (err) {
                console.log("Error in getting all laptops:" + err);
                return null;
            });
    }
}
