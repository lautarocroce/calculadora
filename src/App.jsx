import React, { useState } from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';


const ingredientesLista = [
  { nombre: 'Aceite de almendras', min: 0.5, max: 90 },
  { nombre: 'Aceite esencial de lavanda', min: 2.5, max: 90 },
  { nombre: 'Agua', min: 5, max: 30 },
  { nombre: 'Cacao', min: 6, max: 20 },
  { nombre: 'Cera de abejas', min: 0.5, max: 20 },
  { nombre: 'Conejo', min: 10, max: 35 },
  { nombre: 'Gato', min: 0.1, max: 0.5 },
  { nombre: 'Manteca de cacao', min: 1, max: 90 },
  { nombre: 'Pepegongito', min: 0.01, max: 90 },
  { nombre: 'Pera', min: 7, max: 10 },
  { nombre: 'Perro', min: 0.15, max: 0.75 },
  { nombre: 'Phpgita', min: 0.5, max: 50 },
  { nombre: 'UVA', min: 1, max: 90 },
];

function App() {
  const [datos, setDatos] = useState({
    formulaNumero: '',
    nombreProducto: '',
    funcionTipoPiel: '',
    fechaElaboracion: '',
    fechaVencimiento: '',
    pesoTotal: '',
  });

  const [ingredientes, setIngredientes] = useState(
    [{ nombre: '', usado: 0, gramos: 0 }]

  );

  const [errorMensaje, setErrorMensaje] = useState('');

  const handleDatosChange = (e) => {
    const { name, value } = e.target;
    setDatos((prev) => ({ ...prev, [name]: value }));
  };

  const handleIngredienteChange = (index, field, value) => {
    const nuevosIngredientes = [...ingredientes];
    nuevosIngredientes[index] = {
      ...nuevosIngredientes[index],
      [field]: value,
    };

    setIngredientes(nuevosIngredientes);

    if (field === 'nombre' && value && !nuevosIngredientes.find((ing) => ing.nombre === '')) {
      setIngredientes((prev) => [...prev, { nombre: '', usado: 0, gramos: 0 }]);
    }
  };

  const calcularGramos = (usado) => {
    return (usado * datos.pesoTotal) / 100;
  };

  const calcularPorcentaje = (usado) => {
    return (usado * 100) / datos.pesoTotal;
  };

  const validarDatosBasicos = () => {
    const camposFaltantes = [];
    Object.keys(datos).forEach((key) => {
      if (!datos[key]) camposFaltantes.push(key);
    });
    return camposFaltantes;
  };

  const validarIngredientes = () => {
    let totalUsado = 0;
    for (const ing of ingredientes) {
      if (ing.nombre) {
        const ingredienteDefinido = ingredientesLista.find((i) => i.nombre === ing.nombre);
        if (ingredienteDefinido) {
          if (ing.usado < ingredienteDefinido.min || ing.usado > ingredienteDefinido.max) {
            return `El ingrediente "${ing.nombre}" debe estar entre ${ingredienteDefinido.min}% y ${ingredienteDefinido.max}%.`;
          }
          totalUsado += ing.usado;
        }
      }
    }
    if (totalUsado > 100) return 'El total de porcentaje de ingredientes no puede superar el 100%.';
    return null;
  };

  const generarPDF = () => {
    const camposFaltantes = validarDatosBasicos();
    if (camposFaltantes.length > 0) {
      window.alert(`Complete los campos: ${camposFaltantes.join(', ')}`);
      setErrorMensaje(`Complete los campos: ${camposFaltantes.join(', ')}`);
      return;
    }

    const errorIngredientes = validarIngredientes();
    if (errorIngredientes) {
      setErrorMensaje(errorIngredientes);
      return;
    }

    setErrorMensaje('');
    const doc = new jsPDF();

    // Título del PDF
    doc.setFontSize(18);
    doc.text('Planilla de Formulación', 14, 20);

    // Sección de datos básicos
    doc.setFontSize(12);
    doc.text(`Fórmula Nº: ${datos.formulaNumero}`, 14, 30);
    doc.text(`Nombre del Producto: ${datos.nombreProducto}`, 14, 40);
    doc.text(`Función y Tipo de Piel: ${datos.funcionTipoPiel}`, 14, 50);
    doc.text(`Fecha de Elaboración: ${datos.fechaElaboracion}`, 14, 60);
    doc.text(`Fecha de Vencimiento: ${datos.fechaVencimiento}`, 14, 70);
    doc.text(`Peso Total del Producto (g): ${datos.pesoTotal}`, 14, 80);

    // Tabla de ingredientes
    const tablaIngredientes = ingredientes
      .filter((ing) => ing.nombre)
      .map((ing) => [
        ing.nombre,
        `${ingredientesLista.find((i) => i.nombre === ing.nombre)?.min || ''}%`,
        `${ingredientesLista.find((i) => i.nombre === ing.nombre)?.max || ''}%`,
        `${ing.usado}%`,
        calcularGramos(ing.usado).toFixed(2),
      ]);

    doc.autoTable({
      startY: 90,
      head: [['Ingrediente', '% Min', '% Max', '% Usado', 'Gramos']],
      body: tablaIngredientes,
    });

    // Guardar el PDF
    doc.save('planilla_formulacion.pdf');
  };



  const limpiarIngrediente = (index) => {
    const nuevosIngredientes = [...ingredientes];
    nuevosIngredientes.splice(index, 1);
    setIngredientes(nuevosIngredientes);

    if (!nuevosIngredientes.find((ing) => ing.nombre === '')) {
      setIngredientes((prev) => [...prev, { nombre: '', usado: 0, gramos: 0 }]);
    }
  };







  return (

    <div class="container">

      {/* Tabla ingredientes */}

      <div class="row mb-4">
        <div class="row justify-content-center">
          <div class="col-md-6">
            <h3 class="text-center">Datos Básicos</h3>


            {/* Mensaje Error, dato faltante */}

            {errorMensaje && <p className="text-danger">{errorMensaje}</p>}

            <table class="table table-success table-striped mx-auto">
              <tbody>
                <tr>
                  <td>Fórmula Nº</td>
                  <td>
                    <input
                      type="text"
                      name="formulaNumero"
                      value={datos.formulaNumero}
                      onChange={handleDatosChange}
                      className="form-control"
                    />
                  </td>
                </tr>
                <tr>
                  <td>Nombre del Producto</td>
                  <td>
                    <input
                      type="text"
                      name="nombreProducto"
                      value={datos.nombreProducto}
                      onChange={handleDatosChange}
                      className="form-control"
                    />
                  </td>
                </tr>
                <tr>
                  <td>Función y Tipo de Piel</td>
                  <td>
                    <input
                      type="text"
                      name="funcionTipoPiel"
                      value={datos.funcionTipoPiel}
                      onChange={handleDatosChange}
                      className="form-control"
                    />
                  </td>
                </tr>
                <tr>
                  <td>Fecha de Elaboración</td>
                  <td>
                    <input
                      type="date"
                      name="fechaElaboracion"
                      value={datos.fechaElaboracion}
                      onChange={handleDatosChange}
                      className="form-control"
                    />
                  </td>
                </tr>
                <tr>
                  <td>Fecha de Vencimiento</td>
                  <td>
                    <input
                      type="date"
                      name="fechaVencimiento"
                      value={datos.fechaVencimiento}
                      onChange={handleDatosChange}
                      className="form-control"
                    />
                  </td>
                </tr>
                <tr>
                  <td>Peso Total del Producto (g)</td>
                  <td>
                    <input
                      type="number"
                      name="pesoTotal"
                      value={datos.pesoTotal}
                      onChange={handleDatosChange}
                      className="form-control"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Tabla ingredientes */}

      <div class="row mb-4">
        <div class="row justify-content-center">
          <div class="col-md-8">
            <h3 className="text-center">Calculadora de Ingredientes</h3>
            <table className="table table-success table-striped text-center mx-auto">
              <thead>
                <tr>
                  <th style={{ width: "40%" }}>Ingrediente</th>
                  <th style={{ width: "15%" }}>Min %</th>
                  <th style={{ width: "15%" }}>Max %</th>
                  <th style={{ width: "15%" }}>Usado %</th>
                  <th style={{ width: "15%" }}>Gramos</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {ingredientes.map((ingrediente, index) => {
                  // Lista de ingredientes seleccionados, excluyendo el actual para evitar duplicados
                  const ingredientesSeleccionados = ingredientes
                    .filter((_, i) => i !== index)
                    .map((ing) => ing.nombre);
                  return (
                    <tr key={index}>
                      <td className="text-start">
                        <select
                          value={ingrediente.nombre}
                          onChange={(e) =>
                            handleIngredienteChange(index, "nombre", e.target.value)
                          }
                          className="form-select"
                        >
                          <option value="" disabled>
                            Seleccionar ingrediente
                          </option>
                          {ingredientesLista
                            .filter((ing) => !ingredientesSeleccionados.includes(ing.nombre))
                            .map((ing) => (
                              <option key={ing.nombre} value={ing.nombre}>
                                {ing.nombre}
                              </option>
                            ))}
                        </select>
                      </td>
                      <td>
                        {ingrediente.nombre
                          ? ingredientesLista.find(
                            (ing) => ing.nombre === ingrediente.nombre
                          )?.min
                          : ""}
                      </td>
                      <td>
                        {ingrediente.nombre
                          ? ingredientesLista.find(
                            (ing) => ing.nombre === ingrediente.nombre
                          )?.max
                          : ""}
                      </td>
                      <td>
                        <input
                          type="number"
                          value={ingrediente.usado}
                          onChange={(e) =>
                            handleIngredienteChange(
                              index,
                              "usado",
                              parseFloat(e.target.value) || 0
                            )
                          }
                          onClick={(e) => {
                            if (e.target.value === '0') {
                              e.target.value = '';
                            }
                          }}
                          className="form-control"
                          disabled={!ingrediente.nombre}
                        />
                      </td>
                      <td>
                        {ingrediente.usado
                          ? calcularGramos(ingrediente.usado).toFixed(2)
                          : ""}
                      </td>
                      {/* Columna del botón eliminar */}
                      <td>
                        <button
                          type="button"
                          className="btn btn-danger"
                          onClick={() => limpiarIngrediente(index)} // Llama a la función con el índice de la fila
                        >
                          🗑️
                        </button>

                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Tabla resultado */}

      <div class="row">
        <div class="row justify-content-center">
          <div class="col-md-8">
            <div class="d-flex justify-content-between mb-2 align-items-center">
              <h3 className='mb-0'>Tabla Resumida de Ingredientes

              </h3>
              <button type="button" class="btn btn-success align-bottom" onClick={generarPDF}>Generar PDF</button>
            </div>

            <table class="table table-success table-striped">
              <thead>
                <tr>
                  <th>Ingredientes</th>
                  <th>Usado %</th>
                  <th>Gramos</th>
                </tr>
              </thead>
              <tbody>
                {ingredientes
                  .filter((ingrediente) => ingrediente.nombre)
                  .map((ingrediente, index) => (
                    <tr key={index}>
                      <td>{ingrediente.nombre}</td>
                      <td>{ingrediente.usado}%</td>
                      <td>{calcularGramos(ingrediente.usado).toFixed(2)} g</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
