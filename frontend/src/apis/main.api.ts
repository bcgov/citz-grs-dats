import HttpClient from "./base.api";
require("dotenv").config();

class MainApi extends HttpClient {
  constructor() {
    super(`${"http://localhost:5000/api/"}`);
  }
}

export default MainApi;
