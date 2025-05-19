import { Injectable } from '@angular/core';
import Swal, { SweetAlertIcon } from 'sweetalert2';

@Injectable({
  providedIn: 'root',
})
export class AlertsService {
  alertSuccess(message: string, title?: string): void {
    Swal.fire({
      title: title ? title : 'Todo se realizó con éxito!!',
      text: message,
      icon: 'success',
      timer: 2000,
    });
  }

  alertError(message: string, title?: string): void {
    Swal.fire({
      title: title ? title : 'Oops... ocurrió un error!!',
      text: message,
      icon: 'error',
      timer: 2000,
    });
  }
  
  alertInfo(message: string, title?: string): void {
    Swal.fire({
      title: title ? title : 'Oops...!',
      text: message,
      icon: 'info',
      timer: 2000,
    });
  }
  
  toast(title: string, icon: SweetAlertIcon): void {
    const Toast = Swal.mixin({
      toast: true,
      position: "bottom-end",
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.onmouseenter = Swal.stopTimer;
        toast.onmouseleave = Swal.resumeTimer;
      }
    });
    Toast.fire({
      icon: icon,
      title: title
    });
  }
  
  toastWithCloseButton(title: string, icon: SweetAlertIcon): void {
    const Toast = Swal.mixin({
      toast: true,
      position: "bottom-end",
      showConfirmButton: false,
      showCloseButton: true,
      timer: 4000, // Auto-cierra después de 4 segundos
      timerProgressBar: true, // Muestra una barra de progreso
    });
    Toast.fire({
      icon: icon,
      title: title
    });
  }
  
  showAlert(title: string, icon: SweetAlertIcon, text?: string, callback?: () => void): void {
    Swal.fire({
      title: title,
      text: text,
      icon: icon,
      timer: 3000,
      confirmButtonText: 'OK',
    }).then((result) => {
      if (callback) {
        callback();
      }
    });
  }
  
  async showConfirmationDialog(textConfirm?: string): Promise<boolean> {
    return Swal.fire({
      title: '¿Estás seguro?',
      text: '¡No podrás revertir esto!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: textConfirm ? textConfirm : 'Sí, eliminarlo!',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      return result.isConfirmed;
    });
  }
  
  async showSelectRole(roles: string[]): Promise<string> {
    // Mapea los roles a nombres amigables
    const roleNames: { [key: string]: string } = {
      'user': 'Usuario',
      'admin': 'Administrador',
      'asesor': 'Asesor' // Ajusta según sea necesario
    };

    // Crea las opciones del input
    const inputOptions = roles.reduce((options: any, role: string) => {
      options[role] = roleNames[role] || role; // Usa el nombre amigable o el valor original si no hay mapeo
      return options;
    }, {});
    
    
    return Swal.fire({
      title: "Seleccione el rol con el que desea ingresar",
      input: "select",
      inputOptions: inputOptions,
      inputPlaceholder: "Seleccione un rol",
      showCancelButton: true,
      inputValidator: (value) => {
        return new Promise((resolve) => {
          if (value) {
            resolve();
          } else {
            resolve("Necesita seleccionar un rol.");
          }
        });
      }
    }).then((result) => {
      return result.value;
    });
  }
  

}
