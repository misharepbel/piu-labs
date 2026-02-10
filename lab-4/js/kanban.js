const addButtons = document.querySelectorAll('.add');
const colorButtons = document.querySelectorAll('.color');
const sortButtons = document.querySelectorAll('.sort');

const cols = document.querySelectorAll('.tasks');

const randomColor = () => {
    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);
    return `rgb(${r}, ${g}, ${b})`;
};

let taskCounters = {
    todo: 0,
    doing: 0,
    done: 0,
    ticker: 0,
    updateCounters: function () {
        cols.forEach((col) => {
            colName = col.parentNode.id;
            const counter = col.parentNode.querySelector('.task-counter');
            counter.textContent = 'Ilość zadań: ' + this[colName];
        });
    },
};

//Card
const createCard = (
    id = null,
    txt = 'Nowe zadanie',
    bgColor = randomColor(),
) => {
    const card = document.createElement('div');
    card.className = 'card';
    card.id = id;
    card.style.margin = '0.5rem 1rem';
    card.style.height = '100%';
    card.style.backgroundColor = bgColor;
    card.style.display = 'flex';
    card.style.alignItems = 'center';
    card.style.justifyContent = 'space-between';

    const p = document.createElement('p');
    p.contentEditable = 'true';
    p.style.margin = '1rem 0 1rem 0.3rem';
    p.textContent = txt;

    const buttons = document.createElement('div');

    p.addEventListener('keydown', function () {
        if (p.textContent.length <= 12) {
            card.style.flexDirection = 'row';
            p.style.margin = '1rem 0 1rem 0.3rem';
            buttons.style.marginBottom = '0';
        } else {
            card.style.flexDirection = 'column';
            p.style.margin = '1rem auto';
            buttons.style.marginBottom = '0.5rem';
        }
        saveToLocalStorage();
    });

    //Color
    const colorBtn = document.createElement('button');
    colorBtn.textContent = '🎨';
    colorBtn.style.background = 'none';
    colorBtn.style.border = 'none';
    colorBtn.addEventListener('mouseover', function () {
        colorBtn.style.border = '1px solid #000000';
    });
    colorBtn.addEventListener('mouseleave', function () {
        colorBtn.style.border = 'none';
    });
    colorBtn.addEventListener('click', function () {
        card.style.backgroundColor = randomColor();
        saveToLocalStorage();
    });

    //Arrows
    const arrows = [
        document.createElement('button'),
        document.createElement('button'),
    ];
    arrows[0].textContent = '⬅️';
    arrows[0].className = 'left';
    arrows[0].title = 'W lewo';
    arrows[1].textContent = '➡️';
    arrows[1].className = 'right';
    arrows[1].title = 'W prawo';
    arrows.forEach((element) => {
        element.style.background = 'none';
        element.style.border = 'none';
        element.addEventListener('mouseover', function () {
            element.style.border = '1px solid #000000';
        });
        element.addEventListener('mouseleave', function () {
            element.style.border = 'none';
        });
    });

    const updateArrows = () => {
        const thisCol = card.closest('.tasks');
        const currentIndex = Array.from(cols).indexOf(thisCol);
        arrows[0].style.display = currentIndex === 0 ? 'none' : 'inline';
        arrows[1].style.display =
            currentIndex === cols.length - 1 ? 'none' : 'inline';
    };

    card.updateArrows = updateArrows;

    //Close
    const close = document.createElement('button');
    close.title = 'Usuń zadanie';
    close.style.background = 'none';
    close.style.border = 'none';
    close.addEventListener('mouseover', function () {
        close.style.border = '1px solid #000000';
    });
    close.addEventListener('mouseleave', function () {
        close.style.border = 'none';
    });
    close.addEventListener('click', function () {
        const column = close.closest('.column');
        --taskCounters[column.id];
        taskCounters.updateCounters();
        close.closest('.card').remove();
        saveToLocalStorage();
    });
    close.textContent = '❌';
    card.appendChild(p);
    buttons.appendChild(colorBtn);
    buttons.appendChild(arrows[0]);
    buttons.appendChild(arrows[1]);
    buttons.appendChild(close);
    card.appendChild(buttons);
    return card;
};

//Main button functions

addButtons.forEach((button) => {
    button.addEventListener('click', () => {
        const newCard = createCard();
        newCard.id = 'card-' + taskCounters.ticker;
        const column = button.closest('.column');
        const tasks = column.querySelector('.tasks');
        tasks.appendChild(newCard);
        ++taskCounters[column.id];
        taskCounters.updateCounters();
        newCard.updateArrows();
        ++taskCounters.ticker;
        saveToLocalStorage();
    });
});

colorButtons.forEach((button) => {
    button.addEventListener('click', () => {
        const column = button.closest('.column').querySelector('.tasks');
        Array.from(column.children).forEach((card) => {
            card.style.backgroundColor = randomColor();
        });
        saveToLocalStorage();
    });
});

sortButtons.forEach((button) => {
    button.addEventListener('click', () => {
        const column = button.closest('.column').querySelector('.tasks');
        const cards = Array.from(column.children);
        cards.sort((a, b) => {
            const textA = a.querySelector('p').textContent.toLowerCase();
            const textB = b.querySelector('p').textContent.toLowerCase();
            return textA.localeCompare(textB);
        });
        cards.forEach((card) => {
            column.appendChild(card);
        });
        saveToLocalStorage();
    });
});

//Arrow button handling
cols.forEach((col) => {
    col.addEventListener('click', (e) => {
        if (e.target.className === 'left') {
            card = e.target.closest('.card');
            const currentIndex = Array.from(cols).indexOf(col);
            if (currentIndex > 0) {
                cols[currentIndex - 1].appendChild(card);
                console.log(col.parentNode.className);
                --taskCounters[col.parentNode.id];
                ++taskCounters[cols[currentIndex - 1].parentNode.id];
                taskCounters.updateCounters();
                card.updateArrows();
            }
            saveToLocalStorage();
            return;
        }
        if (e.target.className === 'right') {
            card = e.target.closest('.card');
            const currentIndex = Array.from(cols).indexOf(col);
            if (currentIndex < cols.length - 1) {
                cols[currentIndex + 1].appendChild(card);
                console.log(col.parentNode.className);
                --taskCounters[col.parentNode.id];
                ++taskCounters[cols[currentIndex + 1].parentNode.id];
                taskCounters.updateCounters();
                card.updateArrows();
            }
            saveToLocalStorage();
            return;
        }
    });
});

//LocalStorage
const saveToLocalStorage = () => {
    const state = {
        todo: [],
        doing: [],
        done: [],
        ticker: 0,
    };

    cols.forEach((col) => {
        colName = col.parentNode.id;
        const cards = Array.from(col.children);
        state[colName] = cards.map((card) => ({
            id: card.id,
            text: card.querySelector('p').textContent,
            backgroundColor: card.style.backgroundColor,
        }));
    });

    state.ticker = taskCounters.ticker;

    localStorage.setItem('kanbanState', JSON.stringify(state));
};

const loadFromLocalStorage = () => {
    const savedState = localStorage.getItem('kanbanState');
    if (!savedState) return;

    const state = JSON.parse(savedState);

    taskCounters.ticker = state.ticker || 0;

    cols.forEach((col) => {
        const colName = col.parentNode.id;
        const columnCards = state[colName] || [];
        columnCards.forEach((cardData) => {
            const card = createCard(
                cardData.id,
                cardData.text,
                cardData.backgroundColor,
            );
            col.appendChild(card);
            card.updateArrows();
        });
    });

    taskCounters.todo = state.todo.length;
    taskCounters.doing = state.doing.length;
    taskCounters.done = state.done.length;
    taskCounters.updateCounters();
};

loadFromLocalStorage();
