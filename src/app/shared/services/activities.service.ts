import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {API_URL} from '../constants/settings';

@Injectable({
    providedIn: 'root'
})
export class ActivitiesService {

    constructor(
        private http: HttpClient
    ) {
    }

    public addType(data) {

        return this.http.post(`${API_URL}activity_types/add`, data);
    }

    public getTypes() {

        return this.http.get(`${API_URL}activity_types/get`);
    }


    updateType(params) {
        return this.http.put(`${API_URL}activity_types/update`, params);
    }

    removeType(params) {
        return this.http.post(`${API_URL}activity_types/remove`, params);
    }

    getOneType(params) {
        return this.http.get(`${API_URL}activity_types/getOne`, {params: params});
    }
}