// calculator2.js

// ========== 1. 필요한 요소들을 화면에서 찾아오기 ==========

// querySelector: HTML에서 요소를 하나 찾아온다 (CSS 선택자 방식)
// "#display" -> id가 display인 요소 (계산식이 표시되는 입력칸)
const display = document.querySelector("#display");

// querySelectorAll: 조건에 맞는 요소를 "전부" 찾아온다 (여러 개 → 배열 비슷한 형태)
// ".number" -> class가 number인 모든 버튼 (0~9, 소수점)
const numberButtons = document.querySelectorAll(".number");
const operatorButtons = document.querySelectorAll(".operator");
const clearButton = document.querySelector(".clear");
const enterButton = document.querySelector(".enter");
const onOffButton = document.querySelector(".on-off");

// ========== 2. 계산기 상태를 저장할 변수 ==========

// 계산기가 켜져 있는지(true)/꺼져 있는지(false) 기억하는 변수.
// 값이 바뀌어야 하므로 let 사용.
let isOn = false;


// ========== 3. 숫자 버튼들에 클릭 기능 연결하기 ==========

// numberButtons 안에는 버튼이 여러 개 들어있으니, 하나씩 꺼내서 각각 연결한다.
// for문: i를 0부터 버튼 개수(length)만큼 1씩 늘리며 반복.
for (let i = 0; i < numberButtons.length; i++) {
    const button = numberButtons[i]; // i번째 숫자 버튼

    // addEventListener("click", ...): 이 버튼이 "클릭"되면 { } 안의 코드를 실행하라.
    button.addEventListener("click", function () {
        if (isOn === false) {
            return; // 계산기가 꺼져 있으면 아무것도 안 함
        }

        // 화면에 처음 "0"만 있을 땐, 0을 지우고 누른 숫자로 바꾼다.
        // (안 그러면 "05" 처럼 0이 앞에 붙어버림)
        if (display.value === "0") {
            display.value = button.textContent; // textContent: 버튼에 쓰인 글자(예: "7")
        } else {
            // 이미 뭔가 있으면 뒤에 이어붙인다. (예: "7" + "8" -> "78")
            display.value += button.textContent;
        }
    });
}


// ========== 4. 연산자 버튼들에 클릭 기능 연결하기 ==========

for (let i = 0; i < operatorButtons.length; i++) {
    const button = operatorButtons[i];

    button.addEventListener("click", function () {
        if (isOn === false) {
            return;
        }

        // 연산자는 화면 내용 뒤에 그냥 이어붙인다. (예: "78" + "+" -> "78+")
        display.value += button.textContent;
    });
}


// ========== 5. C(클리어) 버튼: 화면을 0으로 초기화 ==========

clearButton.addEventListener("click", function () {
    if (isOn === false) {
        return;
    }
    display.value = "0"; // 다시 처음 상태로
});


// ========== 6. Enter 버튼: 계산 실행 ==========

enterButton.addEventListener("click", function () {
    if (isOn === false) {
        return;
    }

    // 화면에 있는 식을 가져온다. (예: "1+2*3")
    const expression = display.value;

    // calculate 함수로 계산한 뒤, 결과를 화면에 표시한다.
    const result = calculate(expression);
    display.value = result;
});


// ========== 7. ON/OFF 버튼: 계산기 켜고 끄기 ==========

onOffButton.addEventListener("click", function () {
    if (isOn === false) {
        // 꺼져 있었으면 -> 켠다
        isOn = true;
        display.value = "0";
        onOffButton.classList.add("on"); // CSS의 .on 스타일 적용 (초록색으로 변함)
    } else {
        // 켜져 있었으면 -> 끈다
        isOn = false;
        display.value = "";
        onOffButton.classList.remove("on"); // .on 스타일 제거
    }
});


// ========== 8. 실제 계산을 담당하는 함수 (저번 콘솔 계산기 로직 재활용) ==========

function calculate(input) {
    // 공백 제거
    const expression = input.replace(/ /g, "");

    // --- 숫자와 연산자를 배열로 분리 ---
    const tokens = [];
    let number = "";
    for (let i = 0; i < expression.length; i++) {
        const char = expression[i];
        if (char === "+" || char === "-" || char === "*" || char === "/") {
            tokens.push(Number(number));
            tokens.push(char);
            number = "";
        } else {
            number += char; // 숫자나 소수점(.)이면 이어붙임
        }
    }
    tokens.push(Number(number));

    // --- 먼저 * 와 / 계산 ---
    const step1 = [tokens[0]];
    for (let i = 1; i < tokens.length; i += 2) {
        const operator = tokens[i];
        const next = tokens[i + 1];
        if (operator === "*") {
            const prev = step1.pop();
            step1.push(prev * next);
        } else if (operator === "/") {
            const prev = step1.pop();
            step1.push(prev / next);
        } else {
            step1.push(operator);
            step1.push(next);
        }
    }

    // --- 남은 + 와 - 계산 ---
    let result = step1[0];
    for (let i = 1; i < step1.length; i += 2) {
        const operator = step1[i];
        const next = step1[i + 1];
        if (operator === "+") {
            result += next;
        } else if (operator === "-") {
            result -= next;
        }
    }

    return result; // 계산 결과를 돌려준다
}