function start() {
    // 1.입력받기
    const input = prompt("계산식을 입력하세요. (예: 1 + 1 * 4)");
    if (input === null) {
        return; // 취소를 누르면 멈춤
    }

    // 2.공백 제거 (/ /->" "을 찾아라)
    // "1 + 2 + 3".replace(/ /, "")    // g 없음 → "1+ 2 + 3"  (첫 공백 1개만!)
    // "1 + 2 + 3".replace(/ /g, "")   // g 있음 → "1+2+3"     (모든 공백!)    
    const expression = input.replace(/ /g, "");

    // 3. 숫자와 연산자를 배열로 분리
    // 예: "1+2*3" 을  ->  [1, "+", 2, "*", 3]
    const tokens = []; // 쪼갠 결과를 담을 배열
    let number = "";   // 여러 자리 숫자(예: 12, 345)를 한 글자씩 모을 임시 공간
    // expression의 글자를 맨 앞(0번)부터 끝까지 하나씩 살펴본다.
    // i는 글자의 위치 번호. expression.length는 글자 개수(=끝 지점).    
    for (let i = 0; i < expression.length; i++) {
        const char = expression[i]; // 지금 보고 있는 글자 한 개 (expression[0], [1], ...)
        // 이 글자가 연산자(+, -, *, /)인지 검사
        if (char === "+" || char === "-" || char === "*" || char === "/") {
            // 모아둔 숫자를 "진짜 숫자"로 바꿔 배열에 담는다. (Number("12") -> 12
            tokens.push(Number(number)); // 모아둔 숫자 추가
            tokens.push(char);           // 그다음 연산자도 배열에 담는다.
            number = "";                 // 숫자 공간을 비워서 다음 숫자를 받을 준비.
        } else {
            // 예: "1" 그다음 "2"가 오면 number는 "12"
            number += char;              // 숫자면 계속 이어붙임
        }
    }
    tokens.push(Number(number)); // 마지막 숫자 추가
    // 여기까지 하면 tokens는 예를 들어 [1, "+", 2, "*", 3] 같은 모양이 된다.

    // 4.먼저 * 와 / 계산
    const step1 = [tokens[0]]; // 맨 앞의 첫 숫자를 미리 넣고 시작
    // i를 1부터 시작하고 2씩 건너뛴다(i += 2).
    // 이유: tokens는 [숫자, 연산자, 숫자, 연산자, 숫자...] 구조
    for (let i = 1; i < tokens.length; i += 2) {
        const operator = tokens[i]; // 지금 연산자 (예: "+", "*")
        const next = tokens[i + 1]; // 그 연산자 바로 뒤의 숫자
        if (operator === "*") {
            const prev = step1.pop(); // step1의 맨 끝 숫자를 꺼낸다(pop)
            step1.push(prev * next);  // 꺼낸 숫자 × next 결과를 다시 넣는다.
        } else if (operator === "/") {
            const prev = step1.pop();
            step1.push(prev / next);
        } else {
            // + 나 - 는 지금 계산하지 않고 그대로 보관 (나중에 5단계에서 처리)
            step1.push(operator);
            step1.push(next);
        }
    }
    // 예: [1,"+",2,"*",3] -> 4단계 후 step1 = [1, "+", 6]
    //     (*가 먼저 계산돼서 2*3=6 으로 합쳐짐)

    // 5.그다음 + 와 - 계산
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

    // 6.결과 출력
    console.log("결과: " + result);
}

// const는 재할당이 불가능하지만
// 재실행에서는 다시 함수를 처음부터 다시 돌리는 것이라 재할당이 아닌 할당으로 본다
// start();   // 1번째 실행
// start();   // 2번째 실행 ← 이건 재할당이 아님!