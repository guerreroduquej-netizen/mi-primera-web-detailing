document.addEventListener('DOMContentLoaded', () => {
    // Referencias al DOM
    const sizeBtns = document.querySelectorAll('.size-btn');
    const paintSlider = document.getElementById('paint-condition');
    const modLavado = document.getElementById('mod-lavado');
    const modPulitura = document.getElementById('mod-pulitura');
    const modCeramic = document.getElementById('mod-ceramic');
    const modInterior = document.getElementById('mod-interior');
    const modMotor = document.getElementById('mod-motor');
    
    // Inputs del cliente
    const clientName = document.getElementById('client-name');
    const clientPhone = document.getElementById('client-phone');
    const clientCar = document.getElementById('client-car');
    
    const summaryItems = document.getElementById('summary-items');
    const totalPriceEl = document.getElementById('total-price');
    const btnWhatsapp = document.getElementById('btn-whatsapp');

    // Precios Base (Talla S, Estado Normal)
    const PRICES = {
        lavado: 20,
        ceramic: 40,
        interior: 30,
        motor: 20
    };

    // Estado de la cotización
    let state = {
        sizeName: 'Pequeño (S)',
        sizeMult: 1.0,
        paintState: 1, // 0: Nuevo, 1: Normal, 2: Severo
        paintName: 'Normal (Leves)',
        paintMult: 1.0,
        mods: {
            lavado: false,
            pulitura: 80, // Base para 3 pasos en Talla S
            pulituraName: '3 Pasos (Corrección Full)',
            ceramic: true,
            interior: true,
            motor: false
        }
    };

    // Lógica de cálculo (Regla de 3 / Multiplicadores)
    function calculate() {
        let total = 0;
        let summaryHTML = '';

        const addSummaryItem = (name, price) => {
            summaryHTML += `
                <div class="flex justify-between items-center border-b border-white/5 pb-3 mt-2">
                    <span class="text-gray-300">${name}</span>
                    <span class="text-white font-bold">$${price.toFixed(2)}</span>
                </div>
            `;
        };

        // 1. Pulitura (Afectada por Talla Y Estado de Pintura)
        if (state.mods.pulitura > 0) {
            let pulituraCost = state.mods.pulitura * state.sizeMult * state.paintMult;
            total += pulituraCost;
            
            let paintNote = '';
            if (state.paintMult < 1.0) paintNote = '<span class="text-accent">-20% desc. Pintura Nueva</span>';
            else if (state.paintMult > 1.0) paintNote = '<span class="text-accent">+30% recargo Pintura Severa</span>';
            
            addSummaryItem(`Pulitura: ${state.mods.pulituraName} <br><span class="text-xs text-gray-500">${paintNote}</span>`, pulituraCost);
        }

        // 2. Lavado Base (Afectado por Talla)
        if (state.mods.lavado) {
            let cost = PRICES.lavado * state.sizeMult;
            total += cost;
            addSummaryItem('Lavado Base Premium', cost);
        }

        // 3. Ceramic Coating (Afectado por Talla)
        if (state.mods.ceramic) {
            let cost = PRICES.ceramic * state.sizeMult;
            total += cost;
            addSummaryItem('Ceramic Coating (Protección)', cost);
        }

        // 4. Limpieza Interna (Afectada por Talla)
        if (state.mods.interior) {
            let cost = PRICES.interior * state.sizeMult;
            total += cost;
            addSummaryItem('Limpieza Interna Profunda', cost);
        }

        // 5. Limpieza de Motor (Afectada por Talla)
        if (state.mods.motor) {
            let cost = PRICES.motor * state.sizeMult;
            total += cost;
            addSummaryItem('Limpieza Estética de Motor', cost);
        }

        // Si no hay nada seleccionado
        if (total === 0) {
            summaryHTML = `<div class="text-gray-500 text-center py-4 italic">No has seleccionado ningún servicio.</div>`;
        }

        // Actualizar UI
        summaryItems.innerHTML = summaryHTML;
        totalPriceEl.innerText = `$${Math.round(total)}`;
        return Math.round(total);
    }

    // Eventos: Selección de Talla
    sizeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Resetear estilos
            sizeBtns.forEach(b => {
                b.classList.remove('border-accent', 'bg-accent/10');
                b.classList.add('border-white/10', 'bg-anthracite');
            });
            // Activar actual
            btn.classList.remove('border-white/10', 'bg-anthracite');
            btn.classList.add('border-accent', 'bg-accent/10');
            
            // Actualizar estado
            state.sizeMult = parseFloat(btn.dataset.multiplier);
            state.sizeName = btn.dataset.name;
            calculate();
        });
    });

    // Eventos: Estado de Pintura
    const paintNames = ['Nuevo / Excelente', 'Normal (Marcas Leves)', 'Severo (Rayas Profundas)'];
    const paintMults = [0.8, 1.0, 1.3]; // -20%, Normal, +30%
    
    paintSlider.addEventListener('input', (e) => {
        let val = parseInt(e.target.value);
        state.paintState = val;
        state.paintName = paintNames[val];
        state.paintMult = paintMults[val];
        calculate();
    });

    // Eventos: Checkboxes y Selects
    modLavado.addEventListener('change', (e) => { state.mods.lavado = e.target.checked; calculate(); });
    modCeramic.addEventListener('change', (e) => { state.mods.ceramic = e.target.checked; calculate(); });
    modInterior.addEventListener('change', (e) => { state.mods.interior = e.target.checked; calculate(); });
    modMotor.addEventListener('change', (e) => { state.mods.motor = e.target.checked; calculate(); });
    
    modPulitura.addEventListener('change', (e) => {
        state.mods.pulitura = parseInt(e.target.value);
        state.mods.pulituraName = e.target.options[e.target.selectedIndex].text;
        calculate();
    });

    // Enviar a WhatsApp
    btnWhatsapp.addEventListener('click', () => {
        let total = calculate();
        if (total === 0) {
            alert('Por favor selecciona al menos un servicio para cotizar.');
            return;
        }
        
        if (!clientName.value.trim() || !clientPhone.value.trim()) {
            alert('Por favor, ingresa tu Nombre y Teléfono en la sección "4. Tus Datos".');
            return;
        }

        let phone = "584147080369";
        let text = `Hola *AutoShine*! 🚘✨\nQuiero agendar una evaluación. Aquí están mis datos y mi presupuesto:\n\n`;
        text += `*Datos del Cliente:*\n`;
        text += `👤 Nombre: ${clientName.value.trim()}\n`;
        text += `📞 Teléfono: ${clientPhone.value.trim()}\n`;
        if (clientCar.value.trim()) {
            text += `🚘 Vehículo: ${clientCar.value.trim()}\n`;
        }
        text += `\n`;
        text += `*1. Talla del Vehículo:* ${state.sizeName}\n`;
        text += `*2. Estado de Pintura:* ${state.paintName}\n\n`;
        text += `*3. Módulos Seleccionados:*\n`;
        if (state.mods.lavado) text += `✅ Lavado Base Premium\n`;
        if (state.mods.pulitura > 0) text += `✅ Pulitura: ${state.mods.pulituraName}\n`;
        if (state.mods.ceramic) text += `✅ Ceramic Coating\n`;
        if (state.mods.interior) text += `✅ Limpieza Interna Profunda\n`;
        if (state.mods.motor) text += `✅ Limpieza Estética de Motor\n`;
        
        text += `\n*Precio Estimado Final:* $${total}\n\n`;
        text += `¿Me podrían confirmar disponibilidad para una cita?`;

        let url = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
        window.open(url, '_blank');
    });

    // FAQ Accordion
    const faqBtns = document.querySelectorAll('.faq-btn');
    faqBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const content = btn.nextElementSibling;
            const icon = btn.querySelector('.faq-icon');
            
            // Toggle current
            if (content.classList.contains('hidden')) {
                content.classList.remove('hidden');
                icon.style.transform = 'rotate(45deg)';
                btn.classList.add('text-accent');
            } else {
                content.classList.add('hidden');
                icon.style.transform = 'rotate(0)';
                btn.classList.remove('text-accent');
            }
        });
    });

    // Inicialización al cargar la página
    calculate();
});

// --- Lógica del Modal de Galería ---
const galleryModal = document.getElementById('gallery-modal');
const galleryTitle = document.getElementById('gallery-title');
const galleryDesc = document.getElementById('gallery-desc');
const galleryContainer = document.getElementById('gallery-container');

// Base de datos simulada de fotos "Antes y Después"
const galleryData = {
    pintura: {
        title: "Corrección de Pintura Full",
        desc: "Restauración de brillo, eliminación de arañazos severos y marcas de lavado.",
        images: [
            { before: "https://images.unsplash.com/photo-1600661653561-629509216228?w=500&q=80", after: "https://images.unsplash.com/photo-1619682817481-e994891cd1f5?w=500&q=80" },
            { before: "https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=500&q=80", after: "https://images.unsplash.com/photo-1601362840469-51e4d8d58785?w=500&q=80" }
        ]
    },
    interior: {
        title: "Detailing Interior",
        desc: "Higienización profunda, extracción de manchas y restauración de plásticos.",
        images: [
            { before: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=500&q=80&sat=-100", after: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=500&q=80" }
        ]
    },
    ceramico: {
        title: "Aplicación Cerámica 9H",
        desc: "Protección hidrofóbica extrema, resistencia a químicos y brillo que dura años.",
        images: [
            { before: "https://images.unsplash.com/photo-1553440569-bcc63803a83d?w=500&q=80&sat=-100", after: "https://images.unsplash.com/photo-1553440569-bcc63803a83d?w=500&q=80" }
        ]
    }
};

window.openGalleryModal = (category) => {
    const data = galleryData[category];
    if (!data) return;

    galleryTitle.innerText = data.title;
    galleryDesc.innerText = data.desc;
    
    let html = '<div class="grid grid-cols-1 md:grid-cols-2 gap-8">';
    data.images.forEach((item) => {
        html += `
            <div class="space-y-2">
                <div class="relative rounded-xl overflow-hidden border border-white/10 group shadow-lg">
                    <div class="flex h-56 md:h-72">
                        <!-- Mitad Antes -->
                        <div class="w-1/2 relative border-r border-accent/50 overflow-hidden">
                            <div class="absolute top-3 left-3 bg-darker/80 backdrop-blur text-[10px] font-bold text-white px-2 py-1 rounded shadow z-10 border border-white/10">ANTES</div>
                            <img src="${item.before}" class="w-full h-full object-cover object-left opacity-70 grayscale-[30%]">
                        </div>
                        <!-- Mitad Después -->
                        <div class="w-1/2 relative overflow-hidden">
                            <div class="absolute top-3 right-3 bg-accent text-[10px] font-bold text-white px-2 py-1 rounded shadow z-10">DESPUÉS</div>
                            <img src="${item.after}" class="w-full h-full object-cover object-right">
                        </div>
                    </div>
                </div>
            </div>
        `;
    });
    html += '</div>';
    
    galleryContainer.innerHTML = html;
    
    // Mostrar el modal
    galleryModal.classList.remove('hidden');
    
    // Forzar reflow para que la animación de opacidad funcione
    void galleryModal.offsetWidth;
    
    galleryModal.classList.remove('opacity-0');
    galleryModal.classList.add('flex');
    document.body.style.overflow = 'hidden'; // Bloquear el scroll del fondo
};

window.closeGalleryModal = () => {
    galleryModal.classList.add('opacity-0');
    setTimeout(() => {
        galleryModal.classList.add('hidden');
        galleryModal.classList.remove('flex');
        document.body.style.overflow = '';
    }, 300); // 300ms debe coincidir con la clase duration-300 de Tailwind
};
