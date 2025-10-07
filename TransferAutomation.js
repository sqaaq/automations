// ==UserScript==
// @name         Category Automation
// @namespace    https://github.com/sqaaq/automations/
// @version      1.3
// @description  Автоматическое изменение категории и перенос заявки / iOS/Android/Mac/Win
// @match        https://*.*.*/front/ticket.form.php*
// @grant        none
// @author       Egor & AI
// ==/UserScript==

(function() {
    'use strict';

    // Проверка мобильного устройства
    function isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    // Общая функция для ввода текста и имитации Enter в поле поиска select2
    function inputTextAndEnter(text, enterDelay = 500) {
        const searchInput = document.querySelector('.select2-container--open .select2-search__field');
        if (!searchInput) {
            console.log("Не найдено поле ввода поиска Select2");
            return;
        }
        searchInput.value = text;
        searchInput.dispatchEvent(new Event('input', { bubbles: true }));
        console.log(`Введён текст: ${text}`);

        setTimeout(() => {
            const enterEvent = new KeyboardEvent('keydown', {
                bubbles: true,
                cancelable: true,
                key: 'Enter',
                code: 'Enter',
                keyCode: 13,
                which: 13
            });
            searchInput.dispatchEvent(enterEvent);
            console.log("Нажат Enter");
        }, enterDelay);
    }

    // Открытие select2 по селектору, с проверкой и вызовом callback
    function openSelect2(selector, callback) {
        const selectElement = document.querySelector(selector);
        if (!selectElement) {
            console.log(`Не найден select с селектором ${selector}`);
            if (callback) callback();
            return;
        }
        if (window.jQuery && typeof window.jQuery.fn.select2 === 'function') {
            const $select = window.jQuery(selectElement);
            try {
                $select.select2('open');
                console.log(`Select2 открыт для ${selector}`);
                if (callback) callback(selectElement);
            } catch (err) {
                console.error(`Ошибка открытия Select2 для ${selector}:`, err);
                if (callback) callback();
            }
        } else {
            console.log("jQuery или Select2 не загружены");
            if (callback) callback();
        }
    }

    // Дважды кликнуть крестики удаления выбранных в назначенных
    function clearSelectedAssign(callback) {
        const selectElement = document.querySelector('select[data-actor-type="assign"]');
        if (!selectElement) {
            console.log("select[data-actor-type='assign'] не найден");
            if (callback) callback();
            return;
        }
        const select2Container = selectElement.nextElementSibling;
        if (!select2Container) {
            console.log("Контейнер для assign select2 не найден");
            if (callback) callback();
            return;
        }

        function clickRemove() {
            const removeButtons = select2Container.querySelectorAll('.select2-selection__choice__remove');
            if (removeButtons.length === 0) return;
            removeButtons.forEach(btn => btn.click());
            console.log("Клик по крестикам удаления assign");
        }

        clickRemove();
        setTimeout(() => {
            clickRemove();
            setTimeout(() => {
                if (callback) callback();
            }, 300);
        }, 300);
    }

    // Функция нажатия кнопки Сохранить
    function clickSaveButton() {
        const button = document.querySelector('button.btn.btn-primary[name="update"][form="itil-form"][title="Сохранить"]');
        if (!button) {
            console.log("Кнопка Сохранить не найдена");
            return;
        }
        button.click();
        console.log("Кнопка Сохранить нажата");
    }

    function automation() {
        console.log("Автоматизация запущена");
        // Шаг 1: открыть, ввести в itilcategories_id
        openSelect2('[id^="category_block_"] select[name="itilcategories_id"]', () => {
            setTimeout(() => {
                inputTextAndEnter("UserSupport > Transfer to another group", 500);
                setTimeout(() => {
                    // Шаг 2: открыть assign, очистить, ввести и нажать Enter
                    openSelect2('select[data-actor-type="assign"]', () => {
                        clearSelectedAssign(() => {
                            setTimeout(() => {
                                inputTextAndEnter("L2 - AppSupport > 1С", 500);

                                // Шаг 3: После всех действий нажать Сохранить
                                setTimeout(clickSaveButton, 1000);
                            }, 700); // ждем перед вводом assign текста
                        });
                    });
                }, 1500);
            }, 100);
        });
    }

    if (isMobile()) {
        // Кнопка только для мобильной версии
        const btn = document.createElement('button');
        btn.textContent = '1CTransfer';
        btn.style.position = 'fixed';
        btn.style.top = '10px';
        btn.style.left = '50%';
        btn.style.transform = 'translateX(-50%)';
        btn.style.zIndex = '9999';
        btn.style.padding = '10px 15px';
        btn.style.backgroundColor = '#007bff';
        btn.style.color = 'white';
        btn.style.border = 'none';
        btn.style.borderRadius = '5px';
        btn.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
        btn.style.fontSize = '16px';
        btn.style.cursor = 'pointer';
        btn.addEventListener('click', automation);
        document.body.appendChild(btn);
    } else {
        // Универсальный хоткей Ctrl/Cmd + Shift + A
        window.addEventListener('keydown', function(e) {
            const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
            const ctrlOrCmd = isMac ? e.metaKey : e.ctrlKey;

            if (ctrlOrCmd && e.shiftKey && e.key.toLowerCase() === 'a') {
                e.preventDefault();
                automation();
            }
        });
    }
})();
