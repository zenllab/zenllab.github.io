// Todo 관리 및 파일 업로드/다운로드
const TodoManager = {
    elements: {
        todoForm: () => document.querySelector('.js-toDoForm'),
        todoInput: () => document.querySelector('.js-toDoForm input'),
        todoList: () => document.querySelector('.js-toDoList'),
        addBtn: () => document.querySelector('.js-addBtn')
    },

    init() {
        const form = this.elements.todoForm();
        const input = this.elements.todoInput();
        const addBtn = this.elements.addBtn();
        
        if (form && input && addBtn) {
            addBtn.addEventListener('click', () => this.handleAdd());
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.handleAdd();
                }
            });
        }
    },

    handleAdd() {
        const input = this.elements.todoInput();
        const text = input.value.trim();
        if (text) {
            this.addItem(text);
            input.value = '';
        }
    },

    addItem(text, isChecked = false) {
        const todoList = this.elements.todoList();
        const li = document.createElement('li');
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = isChecked;

        const span = document.createElement('span');
        span.innerText = text;
        
        const delBtn = document.createElement('button');
        delBtn.innerText = 'X';

        if (isChecked) span.style.textDecoration = 'line-through';

        li.appendChild(checkbox);
        li.appendChild(span);
        li.appendChild(delBtn);
        todoList.appendChild(li);

        checkbox.addEventListener('click', () => {
            span.style.textDecoration = checkbox.checked ? 'line-through' : 'none';
            this.saveToLocal();
        });

        delBtn.addEventListener('click', (e) => {
            todoList.removeChild(e.target.parentElement);
            this.saveToLocal();
        });

        this.saveToLocal();
    },

    collectItems() {
        const items = Array.from(this.elements.todoList().querySelectorAll('li'));
        return items.map(li => ({
            text: li.querySelector('span').innerText,
            isChecked: li.querySelector('input[type="checkbox"]').checked
        })).filter(item => item.text.trim());
    },

    saveToLocal() {
        const dateKey = CalendarManager.formatDate(CalendarManager.selectedDate);
        const items = this.collectItems();
        localStorage.setItem(`todo_${dateKey}`, JSON.stringify(items));
    },

    loadFromLocal() {
        const dateKey = CalendarManager.formatDate(CalendarManager.selectedDate);
        const saved = localStorage.getItem(`todo_${dateKey}`);
        
        this.elements.todoList().innerHTML = '';
        
        if (saved) {
            try {
                const items = JSON.parse(saved);
                items.forEach(item => {
                    if (item.text?.trim()) {
                        this.addItem(item.text, item.isChecked || false);
                    }
                });
            } catch (e) {
                console.error('로컬 Todo 로드 실패:', e);
            }
        }
    }
};

// 파일 업로드/다운로드 관리
const FileManager = {
    async uploadReport() {
        if (!DropboxAuth.dbx) {
            alert('먼저 Dropbox에 연결해주세요');
            return;
        }
        
        try {
            const dateKey = CalendarManager.formatDate(CalendarManager.selectedDate);
            const fileName = `report-${dateKey}.html`;
            const content = document.getElementById('report-content').innerHTML;
            const html = `<!doctype html><html><head><meta charset="utf-8"><title>Report ${dateKey}</title></head><body>${content}</body></html>`;
            
            await DropboxAuth.dbx.filesUpload({
                path: `/${fileName}`,
                contents: html,
                mode: { '.tag': 'overwrite' }
            });
            
            alert('Report 저장 완료!');
        } catch (e) {
            console.error('Report 업로드 실패:', e);
            alert('Report 저장 실패: ' + e.message);
        }
    },

    async loadReport() {
        if (!DropboxAuth.dbx) {
            alert('먼저 Dropbox에 연결해주세요');
            return;
        }
        
        try {
            const dateKey = CalendarManager.formatDate(CalendarManager.selectedDate);
            const fileName = `report-${dateKey}.html`;
            
            const response = await DropboxAuth.dbx.filesDownload({ path: `/${fileName}` });
            const text = await response.result.fileBinary.text();
            
            const bodyMatch = text.match(/<body>(.*?)<\/body>/s);
            const content = bodyMatch ? bodyMatch[1] : text;
            document.getElementById('report-content').innerHTML = content;
            
            alert('Report 불러오기 완료!');
        } catch (e) {
            if (e.status === 409) {
                alert('해당 날짜의 Report가 없습니다.');
            } else {
                console.error('Report 다운로드 실패:', e);
                alert('Report 불러오기 실패: ' + e.message);
            }
        }
    },

    async uploadTodo() {
        if (!DropboxAuth.dbx) {
            alert('먼저 Dropbox에 연결해주세요');
            return;
        }
        
        try {
            const dateKey = CalendarManager.formatDate(CalendarManager.selectedDate);
            const fileName = `todo-${dateKey}.json`;
            const payload = {
                date: dateKey,
                items: TodoManager.collectItems(),
                savedAt: new Date().toISOString()
            };
            
            await DropboxAuth.dbx.filesUpload({
                path: `/${fileName}`,
                contents: JSON.stringify(payload, null, 2),
                mode: { '.tag': 'overwrite' }
            });
            
            alert('Todo List 저장 완료!');
        } catch (e) {
            console.error('Todo 업로드 실패:', e);
            alert('Todo List 저장 실패: ' + e.message);
        }
    },

    async loadTodo() {
        if (!DropboxAuth.dbx) {
            alert('먼저 Dropbox에 연결해주세요');
            return;
        }
        
        try {
            const dateKey = CalendarManager.formatDate(CalendarManager.selectedDate);
            const fileName = `todo-${dateKey}.json`;
            
            const response = await DropboxAuth.dbx.filesDownload({ path: `/${fileName}` });
            const text = await response.result.fileBinary.text();
            const data = JSON.parse(text);
            
            TodoManager.elements.todoList().innerHTML = '';
            
            if (data.items?.length) {
                data.items.forEach(item => {
                    if (typeof item === 'object' && item.text) {
                        TodoManager.addItem(item.text.trim(), item.isChecked || false);
                    } else if (typeof item === 'string' && item.trim()) {
                        TodoManager.addItem(item.trim(), false);
                    }
                });
            }
            
            alert('Todo List 불러오기 완료!');
        } catch (e) {
            if (e.status === 409) {
                alert('해당 날짜의 Todo List가 없습니다.');
            } else {
                console.error('Todo 다운로드 실패:', e);
                alert('Todo List 불러오기 실패: ' + e.message);
            }
        }
    }
};

// 초기화
document.addEventListener('DOMContentLoaded', () => {
    TodoManager.init();
});