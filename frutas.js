document.getElementById("vendedor").textContent =" puesto  de Don Efraín";

let filtro = "";

const productos =[
    { nombre: 'Mango', precio: 1800, cantidad: 12 },
    { nombre: 'Guayaba', precio: 1200, cantidad: 8 },
    { nombre: 'Patilla', precio: 6500, cantidad: 2 },
    { nombre: 'Maracuyá', precio: 3400, cantidad: 5 },
    { nombre: 'Níspero', precio: 2900, cantidad: 4 },
  ];

function TablaFrutas(productosMostrados){
  const tbody= document.getElementById("tablaFrutas")
  if (!tbody) return;

  let mensaje = "Mostrando " + productosMostrados.length +" de " + productos.length + " productos.";

    document.getElementById("mensaje").textContent = mensaje;

  if(productosMostrados.length === 0){
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;">No hay productos que coinsidan con el filtro.</td></tr>`;
    return
  }

  if(!productos || productos.length === 0){
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;">No hay productos en inventario.</td></tr>`;
    return
  }

  tbody.innerHTML = "";

  productosMostrados.forEach( p => {
    const fila = tbody.insertRow();

    fila.insertCell(0).textContent = p.nombre;
    fila.insertCell(1).textContent = p.precio;
    fila.insertCell(2).textContent = p.cantidad;
    fila.insertCell(3).textContent = p.precio * p.cantidad;

    const tdButton = document.createElement("td")

    const btnvender = document.createElement("button");
    btnvender.type = 'button'
    btnvender.textContent = "vender 1"
    btnvender.disabled = p.cantidad === 0;
    btnvender.addEventListener('click',() =>{
        vender(p.nombre);
    });

    const btn10 = document.createElement("button");
    btn10.type = 'button'
    btn10.textContent = "+10"
    btn10.addEventListener('click',() =>{
        reabastecer(p.nombre);
    });

    tdButton.appendChild(btnvender);
    tdButton.appendChild(btn10);

    fila.appendChild(tdButton);
  });
}


function calcularTotal(productos){
    return productos.reduce(
        (suma,p) => suma + p.precio * p.cantidad, 0
    );
}

function calcularUnidades(productos){
    return productos.reduce(
        (suma,p) => suma + p.cantidad, 0
    );
}

function vender(nombre){
    const producto = productos.find((p) => p.nombre === nombre);

    if (producto && producto.cantidad > 0) {
        producto.cantidad--;
    }

    mostrarDatos()
}

function reabastecer (nombre){
    const producto = productos.find((p) => p.nombre === nombre);

    if (producto){
        producto.cantidad += 10;
    }

    mostrarDatos()
}

function frutasFiltradas(){
    const caja = document.getElementById("buscarFruta");
    const nombre = caja.value.toLowerCase().trim();

    const filtrados = productos.filter((p) => 
        p.nombre.toLowerCase().includes(nombre)
    );

    TablaFrutas(filtrados)
  }

function limpiarFiltro(){
    document.getElementById("buscarFruta").value = "";
    TablaFrutas(productos);
    mostrarDatos();
}

function mostrarDatos(){
    TablaFrutas(productos);
    const total = calcularTotal(productos)
    document.getElementById("total").textContent = total

    document.getElementById("unidades").textContent = calcularUnidades(productos);

    if (total >= 50000){
        document.getElementById("vtm").style.display = 'block';
    }else{
        document.getElementById("vtm").style.display = 'none';
    }
}

mostrarDatos();

document.getElementById("buscarFruta").addEventListener("input", frutasFiltradas);