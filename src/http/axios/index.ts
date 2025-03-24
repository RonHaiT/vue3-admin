import Axios from './Axios'
import config from './config'
const http = new Axios({
  baseURL: config.baseURL,
  timeout: config.timeout,
  method: config.method,
  headers: {
    isAuth: 1
  }
})

export default http
