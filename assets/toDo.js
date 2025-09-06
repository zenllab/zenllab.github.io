const toDoForm = document.querySelector(".js-toDoForm"),
      toDoInput = toDoForm.querySelector("input"),
      toDoList = document.querySelector(".js-toDoList"),
      addBtn = document.querySelector(".js-addBtn");

const TODO_LS = "toDo"; // 로컬 스토리지 키
const DATE_LS = "date"; // 날짜를 저장할 키

// 항목을 리스트에 추가하는 함수
function paintToDo(text, isChecked = false) {
    const li = document.createElement("li");
    
    // 체크박스 추가
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = isChecked; // 체크박스 상태 복원

    const delBtn = document.createElement("button");
    delBtn.innerText = "X";
    
    const span = document.createElement("span");
    span.innerText = text;

    // 체크되어 있으면 취소선 적용
    if (isChecked) {
        span.style.textDecoration = "line-through";
    }

    li.appendChild(checkbox);
    li.appendChild(span);
    li.appendChild(delBtn);
    toDoList.appendChild(li);

    // 체크박스를 클릭했을 때, 해당 항목에 완료 스타일을 추가/제거
    checkbox.addEventListener("click", () => {
        span.style.textDecoration = checkbox.checked ? "line-through" : "none";
        saveToDoList(); // 상태 저장
    });

    // 삭제 버튼 클릭 시 항목 삭제
    delBtn.addEventListener("click", removeToDo);

    saveToDoList();
}


// 삭제 함수
function removeToDo(event) {
    const li = event.target.parentElement;
    toDoList.removeChild(li);
    saveToDoList(); // 삭제 후 로컬 스토리지 갱신
}

// Add 버튼 클릭 시 To-Do 항목 추가 함수
function handleAddBtnClick() {
    const currentValue = toDoInput.value;
    if (currentValue !== "") {
        paintToDo(currentValue); // 항목 추가
        toDoInput.value = ""; // 입력란 초기화
    }
}

// Enter 키를 누를 때 Add 버튼과 같은 동작을 하게 하기
toDoInput.addEventListener("keydown", function(event) {
    if (event.key === 'Enter') {
        event.preventDefault(); // Enter 키의 기본 동작을 막음 (폼 제출 방지)
        handleAddBtnClick(); // Add 버튼 클릭과 같은 동작 실행
    }
});

// 로컬 스토리지에서 저장된 목록을 불러오는 함수
function loadToDoList() {
    const storedToDoList = localStorage.getItem(TODO_LS);
    if (storedToDoList !== null) {
        const parsedToDoList = JSON.parse(storedToDoList);
        parsedToDoList.forEach(function(toDo) {
            paintToDo(toDo.text, toDo.isChecked); // 체크박스 상태와 함께 항목 추가
        });
    }
}

// 로컬 스토리지에 현재 목록을 저장하는 함수
function saveToDoList() {
    const toDoItems = [];
    const toDoListItems = toDoList.querySelectorAll("li");
    toDoListItems.forEach(function(item) {
        const text = item.querySelector("span").innerText;
        const isChecked = item.querySelector("input").checked; // 체크박스 상태
        toDoItems.push({ text: text, isChecked: isChecked }); // 체크박스 상태도 저장
    });
    localStorage.setItem(TODO_LS, JSON.stringify(toDoItems)); // 로컬 스토리지에 저장
}

// 오늘 날짜를 저장하고 이전 날짜와 비교하는 함수
function checkDate() {
    const today = new Date().toLocaleDateString(); // 현재 날짜 (형식: MM/DD/YYYY)
    const savedDate = localStorage.getItem(DATE_LS);

    // 저장된 날짜가 오늘 날짜와 다르면 리스트를 리셋
    if (savedDate !== today) {
        localStorage.setItem(DATE_LS, today); // 오늘 날짜를 저장
        localStorage.removeItem(TODO_LS); // 기존의 리스트를 삭제하여 리셋
        toDoList.innerHTML = ""; // 화면의 리스트도 비움
    }
}

// 자정마다 리셋하도록 설정
function resetAtMidnight() {
    const now = new Date();
    const millisUntilMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1) - now;

    setTimeout(() => {
        checkDate(); // 자정에 날짜를 체크하고 리셋
        resetAtMidnight(); // 다시 자정에 실행되도록 설정
    }, millisUntilMidnight);
}

// 페이지가 로드될 때 리스트를 불러오는 함수
function init() {
    checkDate(); // 날짜 체크하여 필요시 리셋
    loadToDoList(); // 로컬 스토리지에서 항목 불러오기
    addBtn.addEventListener("click", handleAddBtnClick); // Add 버튼 클릭 시 핸들러
    resetAtMidnight(); // 자정마다 리셋
}

init();
