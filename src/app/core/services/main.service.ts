import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {API_URL} from '@core/constants/global';

@Injectable({
  providedIn: 'root'
})
export class MainService {

  constructor(private http: HttpClient) {
  }

  getFerryLocation() {
    return this.http.get(`${API_URL}home/get_places`);
  }

  changePlace(data) {
    if (data.type) {
      // console.log(data.type)
      const type = data.type.toLowerCase().replace('/', '-');
      return this.http.get(`${API_URL}${type}/get`);
    }
  }

  getDirections(params = {}) {
    return this.http.get(`${API_URL}ferries/get-directions`, {params});
  }

  getRealLocations() {
    return this.http.get(`${API_URL}ferries/get_real_locations`);
  }
}
