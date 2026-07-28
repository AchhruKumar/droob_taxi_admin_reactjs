import { all } from "redux-saga/effects";
import { signUpAction } from "@/modules/Auth/signUp/SignUpActions";
import {
  loginAction,
  logoutAction,
  updateUserAccount,
  verifyAction,
} from "@/modules/Auth/Login/LoginActions";
import { getAllProducts } from "@/modules/Products/redux/ProductActions";
import { getAllContent } from "@/modules/CommonRedux/CommonActions";
import {
  getOrignationAction,
  getSectorsAction,
  getSubSectorsAction,
} from "@/modules/Project/redux/ProjectActions";
import {
  getTemplateDetailsAction,
  drawerAction,
  updateTemplateAction,
} from "@/modules/Templates/TemplateRedux/actions/drawerAction";

export default function* RootSaga() {
  yield all([
    signUpAction(),
    loginAction(),
    verifyAction(),
    getAllProducts(),
    getAllContent(),
    logoutAction(),
    updateUserAccount(),
    getSectorsAction(),
    getSubSectorsAction(),
    getOrignationAction(),
    getTemplateDetailsAction(),
    drawerAction(),
    updateTemplateAction(),
  ]);
}
