import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-privacy-policy',
  standalone: true,
  imports: [CommonModule, IonicModule],
  styles: [
    `
      .privacy-container {
        max-width: 800px;
        margin: 0 auto;
        padding-bottom: 40px;
      }
      h1 {
        font-size: 24px;
        font-weight: bold;
        margin-bottom: 8px;
        color: var(--ion-color-dark);
      }
      .last-updated {
        font-size: 14px;
        color: var(--ion-color-medium);
        margin-bottom: 24px;
      }
      section {
        margin-bottom: 24px;
      }
      h2 {
        font-size: 18px;
        font-weight: 600;
        margin-bottom: 12px;
        color: var(--ion-color-dark);
      }
      p,
      li {
        font-size: 16px;
        line-height: 1.6;
        color: var(--ion-color-dark);
      }
      ul {
        padding-left: 20px;
        margin-bottom: 16px;
      }
      li {
        margin-bottom: 8px;
      }
      a {
        color: var(--ion-color-dark);
        text-decoration: none;
      }
    `,
  ],
  template: `
    <ion-header [translucent]="true">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/"></ion-back-button>
        </ion-buttons>
        <ion-title>Política de Privacidad</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content [fullscreen]="true" class="ion-padding">
      <div class="privacy-container">
        <h1>Política de Privacidad</h1>
        <p class="last-updated">Última actualización: {{ today | date: 'longDate' }}</p>

        <section>
          <h2>1. Introducción</h2>
          <p>
            Bienvenido a <strong>Psignio</strong> ("nosotros", "nuestro"). Respetamos su
            privacidad y estamos comprometidos a proteger su información personal. Esta política de
            privacidad explica cómo recopilamos, usamos y compartimos información sobre usted cuando
            utiliza nuestra aplicación móvil.
          </p>
        </section>

        <section>
          <h2>2. Información que Recopilamos</h2>
          <p>
            Para el funcionamiento básico de la aplicación, podemos recopilar la siguiente
            información:
          </p>
          <ul>
            <li>
              <strong>Respuestas del Quiz:</strong> Las selecciones que hace durante el test de
              personalidad para generar sus resultados.
            </li>
            <li>
              <strong>Información de Uso:</strong> Datos anónimos sobre cómo interactúa con la
              aplicación para mejorar la experiencia de usuario.
            </li>
            <li>
              <strong>Identificadores de Dispositivo:</strong> Información técnica necesaria para
              mantener su sesión y guardar su progreso localmente.
            </li>
          </ul>
          <p>
            <strong>Nota Importante:</strong> No recopilamos información personal identificable
            (como nombre real, dirección física, o número de teléfono) a menos que usted la
            proporcione voluntariamente para funciones específicas (como el pago).
          </p>
        </section>

        <section>
          <h2>3. Uso de la Información</h2>
          <p>Utilizamos la información recopilada para:</p>
          <ul>
            <li>Calcular y mostrar sus resultados de personalidad (Arquetipos).</li>
            <li>
              Procesar pagos para funciones premium (a través de proveedores seguros como Stripe).
            </li>
            <li>Mantener su historial de resultados en su dispositivo.</li>
            <li>Mejorar y optimizar la aplicación.</li>
          </ul>
        </section>

        <section>
          <h2>4. Almacenamiento de Datos</h2>
          <p>
            Sus resultados y progreso se almacenan principalmente de forma local en su dispositivo.
            Si decide crear una cuenta o realizar una compra, cierta información se almacenará de
            forma segura en nuestros servidores para permitir la recuperación de sus compras.
          </p>
        </section>

        <section>
          <h2>5. Servicios de Terceros</h2>
          <p>
            Podemos utilizar servicios de terceros que pueden recopilar información utilizada para
            identificarlo. Enlaces a la política de privacidad de los proveedores de servicios de
            terceros utilizados por la aplicación:
          </p>
          <ul>
            <li>
              <a href="https://policies.google.com/privacy" target="_blank"
                >Google Play Services</a
              >
            </li>
            <li>
              <a href="https://stripe.com/privacy" target="_blank"
                >Stripe (Procesamiento de Pagos)</a
              >
            </li>
          </ul>
        </section>

        <section>
          <h2>6. Seguridad</h2>
          <p>
            Valoramos su confianza al proporcionarnos su información personal, por lo que nos
            esforzamos por utilizar medios comercialmente aceptables para protegerla. Pero recuerde
            que ningún método de transmisión por Internet o método de almacenamiento electrónico es
            100% seguro y confiable, y no podemos garantizar su seguridad absoluta.
          </p>
        </section>

        <section>
          <h2>7. Privacidad de los Niños</h2>
          <p>
            Estos Servicios no se dirigen a nadie menor de 13 años. No recopilamos a sabiendas
            información de identificación personal de niños menores de 13 años. Si descubrimos que
            un niño menor de 13 años nos ha proporcionado información personal, la eliminamos
            inmediatamente de nuestros servidores.
          </p>
        </section>

        <section>
          <h2>8. Cambios en esta Política de Privacidad</h2>
          <p>
            Podemos actualizar nuestra Política de Privacidad de vez en cuando. Por lo tanto, se le
            aconseja revisar esta página periódicamente para ver si hay cambios. Le notificaremos
            cualquier cambio publicando la nueva Política de Privacidad en esta página.
          </p>
        </section>

        <section>
          <h2>9. Contáctenos</h2>
          <p>
            Si tiene alguna pregunta o sugerencia sobre nuestra Política de Privacidad, no dude en
            contactarnos en: [psignios@gmail.com].
          </p>
        </section>
      </div>
    </ion-content>
  `,
})
export class PrivacyPolicyPage {
  today: number = Date.now();
}
