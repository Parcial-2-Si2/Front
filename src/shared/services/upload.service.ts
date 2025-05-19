import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UploadService {
  
  private cloudName = 'doe5urc8k';
  private uploadPreset = 'preset-productos';

  constructor(private http: HttpClient) { }
  
  uploadImage(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', this.uploadPreset);
    formData.append('cloud_name', this.cloudName);

    const url = `https://api.cloudinary.com/v1_1/${this.cloudName}/image/upload`;
   
    return this.http.post(url, formData);
  }
  
}
