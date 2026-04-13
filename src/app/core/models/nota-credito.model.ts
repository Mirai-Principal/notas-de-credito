export interface Cliente {
    error: string | null;
    Codigo: string | null;
    Ruc: string;
    Nombre: string;
    name: string;
    ParticipantePlanPuntos: boolean;
    FactorConversionPuntos: number;
}

export interface NotaCreditoItem {
    id?: string;
    nroFactura: string;
    montoFactura: number;
    fechaFactura: string;
    puntosEquivalentes: number;
    cliente: Cliente;
    descripcion: string;
    estado?: 'pendiente' | 'exito' | 'error';
    mensajeError?: string;
}

export interface NotaCreditoRequest {
    items: NotaCreditoItem[];
    total: number;
    fechaCreacion: string;
}


export interface NotaCreditoItemResponse {
    fechaFactura: string;  //formato: dd/mm/yyyy
    numFactura: string;
    descripcion: string;
    numDocumento: string;   //ruc
    montoFactura: string;
    puntos: string;
}

