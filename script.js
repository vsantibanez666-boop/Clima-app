const API_KEY = 'bd039f1e2b7360b65c2dda004bf97ae2';

const API_URL =
    'https://api.openweathermap.org/data/2.5/weather';

const FORECAST_URL =
    'https://api.openweathermap.org/data/2.5/forecast';
const formulario =
    document.getElementById('formulario');

const inputCiudad =
    document.getElementById('inputCiudad');

const resultado =
    document.getElementById('resultado');

const estado =
    document.getElementById('estado');

const btnUbicacion =
    document.getElementById('btnUbicacion');

const btnTema =
    document.getElementById('btnTema');

const historialDiv =
    document.getElementById('historial');

const pronosticoDiv =
    document.getElementById('pronostico');

let historial =
    JSON.parse(
        localStorage.getItem('historial')
    ) || [];

mostrarHistorial();
function guardarHistorial(ciudad) {

    const ciudadNormalizada =
        ciudad.trim();

    historial =
        historial.filter(
            item =>
                item.toLowerCase() !==
                ciudadNormalizada.toLowerCase()
        );
    historial.unshift(ciudadNormalizada);
    historial =
        historial.slice(0, 5);
    localStorage.setItem(
        'historial',
        JSON.stringify(historial)
    );

    mostrarHistorial();
}


function mostrarHistorial() {

    if (historial.length === 0) {

        historialDiv.innerHTML =
            '<p>No hay búsquedas todavía.</p>';

        return;
    }

    historialDiv.innerHTML = '';

    historial.forEach(ciudad => {

        const boton =
            document.createElement('button');

        boton.textContent =
            ciudad;

        boton.classList.add(
            'boton-historial'
        );

        boton.addEventListener(
            'click',
            () => consultarClima(ciudad)
        );

        historialDiv.appendChild(boton);
    });
}
async function consultarClima(ciudad) {

    estado.textContent =
        ' Consultando el clima...';

    resultado.classList.remove('visible');

    try {

        const ciudadCodificada =
            encodeURIComponent(ciudad);

        const url =
            `${API_URL}?q=${ciudadCodificada}` +
            `&appid=${API_KEY}` +
            `&units=metric` +
            `&lang=es`;

        const respuesta =
            await fetch(url);


        if (!respuesta.ok) {

            if (respuesta.status === 404) {

                throw new Error(
                    'Ciudad no encontrada'
                );

            } else if (respuesta.status === 401) {

                throw new Error(
                    'API Key inválida'
                );

            } else {

                throw new Error(
                    'Error en la petición: ' +
                    respuesta.status
                );
            }
        }


        const datos =
            await respuesta.json();
        mostrarClima(datos);
        guardarHistorial(ciudad);

        consultarPronostico(
            datos.coord.lat,
            datos.coord.lon
        );

        estado.textContent =
            ' Datos actualizados correctamente.';

    }

    catch (error) {

        console.error(
            'Error:',
            error
        );

        estado.textContent =
            ` ${error.message}. ` +
            `Intenta con otra ciudad.`;

        resultado.classList.remove(
            'visible'
        );
    }
}
function mostrarClima(datos) {

    const ciudad =
        datos.name;

    const pais =
        datos.sys.country;

    const temperatura =
        Math.round(
            datos.main.temp
        );

    const sensacion =
        Math.round(
            datos.main.feels_like
        );

    const humedad =
        datos.main.humidity;

    const presion =
        datos.main.pressure;

    const viento =
        datos.wind.speed;

    const descripcion =
        datos.weather[0].description;

    const icono =
        datos.weather[0].icon;


  const iconoUrl =
    `https://openweathermap.org/img/wn/${icono}@2x.png`;


    resultado.innerHTML = `

        <div class="ciudad">
            ${ciudad}
        </div>

        <div class="pais">
            ${pais}
        </div>

        <img
            src="${iconoUrl}"
            alt="${descripcion}"
            class="icono-clima"
        >

        <div class="temperatura">
            ${temperatura}°C
        </div>

        <div class="descripcion">
            ${descripcion}
        </div>

        <div class="detalles">

            <div class="detalle">
                <div class="etiqueta">
                    Sensación
                </div>

                <div class="valor">
                    ${sensacion}°C
                </div>
            </div>


            <div class="detalle">
                <div class="etiqueta">
                    Humedad
                </div>

                <div class="valor">
                    ${humedad}%
                </div>
            </div>


            <div class="detalle">
                <div class="etiqueta">
                    Presión
                </div>

                <div class="valor">
                    ${presion} hPa
                </div>
            </div>


            <div class="detalle">
                <div class="etiqueta">
                    Viento
                </div>

                <div class="valor">
                    ${viento} m/s
                </div>
            </div>

        </div>

        <button
            id="btnWhatsApp"
            class="btn-whatsapp"
            type="button"
        >
             Compartir en WhatsApp
        </button>
    `;


    resultado.classList.add(
        'visible'
    );


    cambiarFondoSegunClima(
        datos.weather[0].main
    );
    const btnWhatsApp =
        document.getElementById(
            'btnWhatsApp'
        );

    btnWhatsApp.addEventListener(
        'click',
        () => {

            const mensaje =
                `El clima en ${ciudad} ` +
                `es de ${temperatura}°C. ` +
                `Condición: ${descripcion}.`;

            const urlWhatsApp =
                `https://wa.me/?text=` +
                `${encodeURIComponent(mensaje)}`;

            window.open(
                urlWhatsApp,
                '_blank'
            );
        }
    );
}
function cambiarFondoSegunClima(
    clima
) {

    document.body.classList.remove(
        'clima-soleado',
        'clima-nublado',
        'clima-lluvioso',
        'clima-nieve'
    );


    const climaLower =
        clima.toLowerCase();


    if (
        climaLower.includes('clear')
    ) {

        document.body.classList.add(
            'clima-soleado'
        );

    }

    else if (
        climaLower.includes('cloud')
    ) {

        document.body.classList.add(
            'clima-nublado'
        );

    }

    else if (
        climaLower.includes('rain') ||
        climaLower.includes('drizzle') ||
        climaLower.includes('thunderstorm')
    ) {

        document.body.classList.add(
            'clima-lluvioso'
        );

    }

    else if (
        climaLower.includes('snow')
    ) {

        document.body.classList.add(
            'clima-nieve'
        );
    }
}
btnUbicacion.addEventListener(
    'click',
    () => {

        if (
            !navigator.geolocation
        ) {

            estado.textContent =
                'Tu navegador no permite geolocalización.';

            return;
        }


        estado.textContent =
            'Obteniendo tu ubicación...';


        navigator.geolocation.getCurrentPosition(

            async (posicion) => {

                const lat =
                    posicion.coords.latitude;

                const lon =
                    posicion.coords.longitude;


                try {

                    const url =
                        `${API_URL}?lat=${lat}` +
                        `&lon=${lon}` +
                        `&appid=${API_KEY}` +
                        `&units=metric` +
                        `&lang=es`;


                    const respuesta =
                        await fetch(url);


                    if (!respuesta.ok) {

                        throw new Error(
                            'No se pudo obtener el clima.'
                        );
                    }


                    const datos =
                        await respuesta.json();


                    mostrarClima(datos);


                    guardarHistorial(
                        datos.name
                    );


                    consultarPronostico(
                        lat,
                        lon
                    );


                    estado.textContent =
                        ' Clima de tu ubicación actual.';

                }

                catch (error) {

                    console.error(
                        error
                    );

                    estado.textContent =
                        ' No se pudo obtener ' +
                        'el clima de tu ubicación.';
                }
            },


            () => {

                estado.textContent =
                    ' No se pudo obtener tu ubicación. ' +
                    'Permite el acceso a la ubicación.';
            }
        );
    }
);
async function consultarPronostico(
    lat,
    lon
) {

    pronosticoDiv.innerHTML =
        '<p> Cargando pronóstico...</p>';


    try {

        const url =
            `${FORECAST_URL}?lat=${lat}` +
            `&lon=${lon}` +
            `&appid=${API_KEY}` +
            `&units=metric` +
            `&lang=es`;


        const respuesta =
            await fetch(url);


        if (!respuesta.ok) {

            throw new Error(
                'No se pudo obtener el pronóstico.'
            );
        }


        const datos =
            await respuesta.json();


        mostrarPronostico(
            datos.list
        );

    }

    catch (error) {

        console.error(
            error
        );

        pronosticoDiv.innerHTML =
            '<p> No se pudo cargar el pronostico.</p>';
    }
}
function mostrarPronostico(
    lista
) {

    pronosticoDiv.innerHTML = '';


    /*
        OpenWeather devuelve datos cada 3 horas.

        Seleccionamos aproximadamente un dato
        por día.
    */

    const dias = {};

    lista.forEach(item => {

        const fecha =
            new Date(
                item.dt * 1000
            );

        const clave =
            fecha.toLocaleDateString(
                'es-MX'
            );


        if (!dias[clave]) {

            dias[clave] =
                item;
        }
    });


    const pronosticos =
        Object.values(dias)
            .slice(0, 5);


    pronosticos.forEach(
        item => {

            const fecha =
                new Date(
                    item.dt * 1000
                );


            const dia =
                fecha.toLocaleDateString(
                    'es-MX',
                    {
                        weekday: 'long'
                    }
                );


            const temperatura =
                Math.round(
                    item.main.temp
                );


            const descripcion =
                item.weather[0]
                    .description;


            const icono =
                item.weather[0].icon;


            const iconoUrl =
                `https://openweathermap.org/img/wn/` +
                `${icono}@2x.png`;


            const tarjeta =
                document.createElement(
                    'div'
                );


            tarjeta.classList.add(
                'dia-pronostico'
            );


            tarjeta.innerHTML = `

                <h3>
                    ${dia}
                </h3>

                <img
                    src="${iconoUrl}"
                    alt="${descripcion}"
                >

                <div class="temp">
                    ${temperatura}°C
                </div>

                <div class="descripcion">
                    ${descripcion}
                </div>

            `;


            pronosticoDiv.appendChild(
                tarjeta
            );
        }
    );
}
btnTema.addEventListener(
    'click',
    () => {

        document.body.classList.toggle(
            'claro'
        );

        if (
            document.body.classList.contains(
                'claro'
            )
        ) {
        
            btnTema.textContent =
                ' Modo oscuro';

        }
        else {

            btnTema.textContent =
                ' Modo claro';
        }
    }
);
formulario.addEventListener(
    'submit',
    (e) => {

        e.preventDefault();


        const ciudad =
            inputCiudad.value.trim();


        if (!ciudad) {

            estado.textContent =
                ' Escribe el nombre de una ciudad.';

            return;
        }


        consultarClima(
            ciudad
        );
    }
);
estado.textContent =
    'Escribe una ciudad y presiona "Consultar".';