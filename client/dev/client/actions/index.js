import * as actions from './action-types';
import callApi from '../utils/apiCaller';

export const attemptLogin = (credentials) => {
	return (dispatch) => {
        dispatch(showLoading());
        return callApi('api/users/login', 'post', {
            email: credentials.email,
            password: credentials.password,
        }).then(
            res => dispatch(receiveAttemptLogin(res)),
            error => dispatch(receiveAttemptLogin({ data: undefined }))
        );
    };
}

export const showLoading = () => {
    return { type: actions.ATTEMPT_LOGIN };
}

export const receiveAttemptLogin = (result) => {
    if (result.data !== undefined) {
        return {
            type: actions.ACCEPT_LOGIN,
            token: result.data,
        };
    } else {
        return {
            type: actions.REJECT_LOGIN
        };
    }
}

export const setToken = (token) => {
    return {
        type: actions.SET_TOKEN,
        token: token
    };
}

export const deleteToken = () => {
    return { type: actions.DELETE_TOKEN };
}

export const attemptRegistration = (credentials) => {
    return (dispatch) => {
        return callApi('api/users', 'post', {
            fname: credentials.fname,
            lname: credentials.lname,
            email: credentials.email,
            password: credentials.password,
            address: credentials.address,
            phone: credentials.phone,
        }).then(
            res => dispatch(receiveAttemptRegistration(res)),
            error => dispatch(receiveAttemptRegistration({ data: undefined }))
        );
    }
}

export const receiveAttemptRegistration = (result) => {
    if (result.data !== undefined) {
        return {
            type: actions.ACCEPT_REGISTRATION,
        };
    } else {
        return {
            type: actions.REJECT_REGISTRATION
        };
    }
}

export const showRegistration = () => { return { type: actions.SHOW_REGISTRATION }; }

export const hideRegistration = () => { return { type: actions.HIDE_REGISTRATION }; }

export const setProductFilter = (filter) => {
    return {
        type: actions.SET_PRODUCTS_FILTER,
        productFilter: filter
    }
}

export const getProductsRequest = () => {
    return { type: actions.GET_PRODUCTS_REQUEST };
}

export const getProductsSuccess = (products) => {
    return {
        type: actions.GET_PRODUCTS_SUCCESS,
        products: products
    };
}

export const getProductsFailure = (error) => {
    return {
        type: actions.GET_PRODUCTS_FAILURE,
        error: error
    };
}

function shouldGetProducts(state) {
    const products = state.product.products;

    if (!products || !state.product.isFetching) {
        return true;
    } else {
        return false;
    }
}

export const getProducts = () => {
    return function (dispatch, getState) {
        if (getState().authentication && getState().authentication.token) {
            if (shouldGetProducts(getState())) {
                dispatch(getProductsRequest());
                
                let queryStarted = false;

                let endPoint = 'api/products';

                if (getState().product.productFilter) {
                    endPoint = `api/products?type=${getState().product.productFilter}`
                    queryStarted = true;
                }

                // Add paging and number of items
                if (queryStarted) {
                    endPoint += '&';
                } else {
                    endPoint += '?';
                }
                endPoint += `page=${getState().product.page}&numOfItems=${getState().product.productsPerPage}`;

                console.log(endPoint);

                return callApi(endPoint, 'get', undefined, `Bearer ${getState().authentication.token}`).then(
                    res => dispatch(getProductsSuccess(res.data)),
                    error => dispatch(getProductsFailure(error))
                );
            }
        }
    };
}

export const setPage = (number) => {
    return {
        type: actions.SET_PRODUCT_PAGE,
        pageNumber: number
    };
}

export const incrementPage = () => {
    return {
        type: actions.INCREMENT_PRODUCT_PAGE
    };
}

export const showNextProductPage = () => {
    return function (dispatch) {
        dispatch(incrementPage());
        dispatch(getProducts());
    }
}

export const decrementPage = () => {
    return {
        type: actions.DECREMENT_PRODUCT_PAGE
    };
}

export const showPreviousProductPage = () => {
    return function (dispatch) {
        dispatch(decrementPage());
        dispatch(getProducts());
    }
}

export const showSnackbar = () => {
    return { type: actions.SHOW_SNACKBAR };
}
export const hideSnackbar = () => {
    return { type: actions.HIDE_SNACKBAR };
}

export const showProductView = (product) => {
    return { 
		type: actions.SHOW_PRODUCT_VIEW_DIALOG,
		product
	};
}

export const addProductRequest = () => { return { type: actions.ADD_PRODUCT_REQUEST }; }

export const addProductSuccess = (result) => { return { type: actions.ADD_PRODUCT_SUCCESS }; }

export const addProductFailure = (error) => { return { type: actions.ADD_PRODUCT_FAILURE }; }

export const showAddProduct = () => { return { type: actions.SHOW_ADD_PRODUCT_DIALOG }; }

export const hideAddProduct = () => { return { type: actions.HIDE_ADD_PRODUCT_DIALOG }; }

export const addProductSuccessSnackbar = () => { return { type: actions.ADD_PRODUCT_SUCCESS_SNACKBAR }; }

function shouldAddProduct(state) {
    if (!state.product.addProduct.addingProduct) {
        return true;
    } else {
        return false;
    }
}

export const addProduct = (body) => {
  return (dispatch, getState) => {
    if (getState().authentication && getState().authentication.token) {
        if (shouldAddProduct(getState())) {
            dispatch(addProductRequest());

            body = {
                ...body,
                electronictype: body.electronicType,
                displaysize: body.displaySize,
                harddrive: body.hardDrive,
                touchscreen: body.touchScreen
            };

            return callApi('api/products', 'post', body, `Bearer ${getState().authentication.token}`).then(
                res => {
                    dispatch(addProductSuccess(res));
                    dispatch(addProductSuccessSnackbar());
                    dispatch(getProducts());
                },
                error => dispatch(addProductFailure())
            );
        }
    }
  };
}

export const deleteProduct = (product) => {
  return (dispatch, getState) => {
    if (getState().authentication && getState().authentication.token) {
      return callApi(`api/products/${product.id}`, 'delete', undefined, `Bearer ${getState().authentication.token}`).then(
          res => dispatch(getProducts()),
          error => console.log("error in deleting")
      );
    }
  };
}

export const hideProductView = () => { return { type: actions.HIDE_PRODUCT_VIEW_DIALOG }; }

export const showDeleteProduct = (product) => {
    return { 
		type: actions.SHOW_DELETE_PRODUCT_DIALOG,
		product
	};
}

export const hideDeleteProduct = () => { return { type: actions.HIDE_DELETE_PRODUCT_DIALOG }; }

export const showModifyProduct = (product) => { 
    return { 
        type: actions.SHOW_MODIFY_PRODUCT_DIALOG,
        product
    }; 
}

export const hideModifyProduct = () => { return { type: actions.HIDE_MODIFY_PRODUCT_DIALOG }; }

export const modifyProductRequest = () => { return { type: actions.MODIFY_PRODUCT_REQUEST }; }

export const modifyProductSuccess = () => { return { type: actions.MODIFY_PRODUCT_SUCCESS }; }

export const modifyProductFailure = () => { return { type: actions.MODIFY_PRODUCT_FAILURE }; }

function shouldModifyProduct(state) {
    if (!state.product.modifyProduct.modifyingProduct) {
        return true;
    } else {
        return false;
    }
}

export const modifyProductSuccessSnackbar = () => { return { type: actions.MODIFY_PRODUCT_SUCCESS_SNACKBAR }; }

export const modifyProduct = (body) => {
    return (dispatch, getState) => {
        if (getState().authentication && getState().authentication.token && getState().product.modifyProduct) {
            if (shouldModifyProduct(getState())) {
                dispatch(modifyProductRequest());

                body = {
                    ...body,
                    electronictype: body.electronicType,
                    displaysize: body.displaySize,
                    harddrive: body.hardDrive,
                    touchscreen: body.touchScreen
                };

                return callApi(`api/products/${getState().product.dropDownsProduct.id}`, 'put', body, `Bearer ${getState().authentication.token}`).then(
                    res => {
                        dispatch(modifyProductSuccess(res));
                        dispatch(modifyProductSuccessSnackbar());
                        dispatch(getProducts());
                    },
                    error => dispatch(modifyProductFailure())
                );
            }
        }
    };
}
