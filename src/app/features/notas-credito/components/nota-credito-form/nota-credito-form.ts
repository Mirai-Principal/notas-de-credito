import { Component, output, signal, computed, inject, effect, Signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { debounceTime, distinctUntilChanged, switchMap, startWith } from 'rxjs/operators';
import { of } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { Cliente, NotaCreditoItem } from '../../../../core/models/nota-credito.model';
import { ClienteService } from '../../../../core/services/cliente.service';
import { NotaCreditoService } from '../../../../core/services/nota-credito.service';

@Component({
  selector: 'app-nota-credito-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatAutocompleteModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatDialogModule
  ],
  templateUrl: './nota-credito-form.html',
  styleUrl: './nota-credito-form.css'

})
export class NotaCreditoFormComponent {

  private fb = inject(FormBuilder);
  private clienteService = inject(ClienteService);
  private notaCreditoService = inject(NotaCreditoService);
  private dialogData = inject<NotaCreditoItem | null>(MAT_DIALOG_DATA, { optional: true });
  private dialogRef = inject(MatDialogRef<NotaCreditoFormComponent>, { optional: true });

  // Output
  itemAgregado = output<NotaCreditoItem>();

  // Formulario reactivo
  formulario: FormGroup;

  // Signals
  clienteSeleccionado = signal<Cliente | null>(null);
  clientesFiltrados!: Signal<Cliente[]>;
  datosOriginales = signal<NotaCreditoItem | null>(null);
  esEdicion = signal<boolean>(false);

  puntosEquivalentes!: Signal<number>;

  constructor() {
    // Inicializar formulario
    this.formulario = this.fb.group({
      clienteBusqueda: ['', Validators.required],
      nroFactura: ['', [
        Validators.pattern(/^\d{3}-\d{3}-\d{9}$/) // Formato: 001-001-000123456
      ]],
      montoFactura: [0, [Validators.required, Validators.min(0.01), this.maxDecimalsValidator()]],
      fechaFactura: [null, Validators.required],
      descripcion: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(200)]]
    });

    // Si hay datos del modal (edición), cargarlos
    if (this.dialogData) {
      this.cargarDatosParaEdicion(this.dialogData);
    }

    const montoControl = this.formulario.get('montoFactura')!;
    const montoSignal = toSignal(montoControl.valueChanges.pipe(startWith(montoControl.value || 0)), { initialValue: montoControl.value || 0 });

    //? calcular puntos equivalentes
    this.puntosEquivalentes = computed(() => {
      const cliente = this.clienteSeleccionado();
      const factor = cliente?.FactorConversionPuntos || 0;
      return this.notaCreditoService.calcularPuntos(montoSignal(), factor);
    });

    // Configurar búsqueda de clientes con debounce
    const busquedaControl = this.formulario.get('clienteBusqueda')!;

    const busquedaResults$ = busquedaControl.valueChanges.pipe(
      startWith(''),
      debounceTime(300),  //? tiempo de espera antes de enviar la solicitud
      distinctUntilChanged(),  //? evitar solicitudes duplicadas
      switchMap(value => {
        // Si es un objeto Cliente, no buscar
        if (typeof value !== 'string') {
          return of([]);
        }

        const termino = value.trim();
        if (termino.length < 3) {
          return of([]);
        }

        return this.clienteService.buscarClientes(termino);
      })
    );

    this.clientesFiltrados = toSignal(busquedaResults$, { initialValue: [] });

    // Effect para recalcular puntos cuando cambia el monto
    effect(() => {
      const puntos = this.puntosEquivalentes();
      // Los puntos se actualizan automáticamente en el template
    });
  }

  displayCliente = (cliente: Cliente | string): string => {
    if (typeof cliente === 'string') {
      return cliente;
    }
    return cliente ? this.obtenerNombreCorto(cliente.Nombre) : '';
  };

  onClienteSeleccionado(cliente: Cliente) {
    this.clienteSeleccionado.set(cliente);
    // Actualizar el FormControl con el objeto completo
    this.formulario.patchValue({
      clienteBusqueda: cliente
    });
  }

  obtenerNombreCorto(nombreCompleto: string): string {
    return this.clienteService.obtenerNombreCorto(nombreCompleto);
  }


  agregarItem() {
    if (this.formulario.valid) {
      const valores = this.formulario.value;

      //si viene vacio se tiene q usar un valor por defecto
      valores.nroFactura = valores.nroFactura || this.clienteService.generarNumeroFactura(valores.clienteBusqueda.Ruc, valores.montoFactura);

      const nuevoItem: NotaCreditoItem = {
        id: this.dialogData?.id || crypto.randomUUID(), // Usar ID existente si es edición
        cliente: this.clienteSeleccionado()!,
        nroFactura: valores.nroFactura,
        montoFactura: valores.montoFactura,
        fechaFactura: this.formatearFecha(valores.fechaFactura),
        puntosEquivalentes: this.puntosEquivalentes(),
        descripcion: valores.descripcion
      };

      // Si es modal, cerrar con el resultado, sino emitir como antes
      if (this.dialogRef) {
        this.dialogRef.close(nuevoItem);
      } else {
        this.itemAgregado.emit(nuevoItem);
        this.limpiarFormulario();
      }
    }
  }

  limpiarFormulario() {
    this.formulario.reset({
      clienteBusqueda: '',
      nroFactura: '',
      montoFactura: 0,
      fechaFactura: null,
      descripcion: ''
    });
    this.clienteSeleccionado.set(null);
    this.formulario.markAsUntouched();
    this.formulario.markAsPristine();
  }

  private formatearFecha(fecha: Date): string {
    if (!fecha) return '';
    return `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}-${String(fecha.getDate()).padStart(2, '0')}`;
  }

  today(): Date {
    return new Date();
  }

  // Validador personalizado para máximo 2 decimales
  maxDecimalsValidator() {
    return (control: any) => {
      const value = control.value;
      if (value === null || value === undefined || value === '') {
        return null;
      }

      const stringValue = value.toString();
      const decimalIndex = stringValue.indexOf('.');
      return (decimalIndex !== -1 && stringValue.length - decimalIndex - 1 > 2) ? { maxDecimals: true } : null;
    };
  }

  limitarDecimales(event: any) {
    const value = event.target.value;
    const decimalIndex = value.indexOf('.');
    if (decimalIndex !== -1 && value.length - decimalIndex - 1 > 2) {
      const newValue = value.substring(0, decimalIndex + 3);
      event.target.value = newValue;
      this.formulario.get('montoFactura')?.setValue(newValue, { emitEvent: false });
    }
  }

  // Método para cargar datos para edición
  cargarDatosParaEdicion(item: NotaCreditoItem) {
    this.esEdicion.set(true);
    this.datosOriginales.set({ ...item }); // Guardar copia de datos originales
    this.clienteSeleccionado.set(item.cliente);

    // Si el número de factura empieza con "A", fue generado automáticamente, dejarlo vacío
    const nroFacturaValue = item.nroFactura.startsWith('A') ? '' : item.nroFactura;

    this.formulario.patchValue({
      clienteBusqueda: item.cliente,
      nroFactura: nroFacturaValue,
      montoFactura: item.montoFactura,
      fechaFactura: this.parseDateToLocal(item.fechaFactura),
      descripcion: item.descripcion
    });
  }

  parseDateToLocal(dateString: string): Date {
    const dateParts = dateString.split('-');
    return new Date(parseInt(dateParts[0]), parseInt(dateParts[1]) - 1, parseInt(dateParts[2]));
  }

  cancelar() {
    if (this.dialogRef) {
      // Siempre devolver null al cancelar para conservar los datos originales
      this.dialogRef.close(null);
    }
  }
}