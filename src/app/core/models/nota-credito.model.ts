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
}

export interface NotaCreditoRequest {
    items: NotaCreditoItem[];
    total: number;
    fechaCreacion: string;
}