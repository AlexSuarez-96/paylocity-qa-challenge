Paylocity Benefits Dashboard - QA Automation Challenge
Este proyecto contiene la suite de pruebas automatizadas y la documentación de hallazgos para el Dashboard de Beneficios de Paylocity. Se aplicó un enfoque integral que combina pruebas de interfaz de usuario (UI), validación de APIs y reporteo técnico de defectos.

## 🛠️ Tecnologías y Herramientas
* **Playwright**: Automatización de pruebas E2E (End-to-End).
* **JavaScript**: Lenguaje de programación de los scripts.
* **Postman**: Pruebas de integración y validación de endpoints de la API.
* **Git/GitHub**: Control de versiones y organización del proyecto.

## 📁 Estructura del Repositorio
* `tests/`: Contiene los scripts de automatización de Playwright (Bugs B-001 al B-006).
* `postman/`: Incluye la colección JSON para importar y validar la API de beneficios.
* `docs/`: Reportes de defectos detallados con análisis técnico y evidencias visuales.

## 🐞 Bugs Clave Automatizados
Se automatizaron 6 hallazgos críticos, destacando:
* **Sesión y Seguridad**: Validación de falta de manejo de sesiones expiradas (B-006).
* **Integridad de Datos**: Identificación de campos invertidos en la interfaz (B-001).
* **Robustez**: Manejo de errores ante entradas masivas de datos y latencia de red.

## ⚙️ Cómo ejecutar los tests
1. Clonar el repositorio.
2. Instalar dependencias: `npm install`
3. Ejecutar suite de pruebas: `npx playwright test`
