export interface InfoBoleta {
  r_nombre: string;
  r_identificacion: string;
  r_email: string;
  r_tipo_pago: string;
  r_piso: string | null;
  r_lote: string | null;
  r_calle: string | null;
  r_distrito: string;
  r_provincia: string;
  r_departamento: string;
  r_pais: string;
  r_metodo_envio: string;
  r_estado: string;
}
