// ========== 1. 화면 요소들 가져오기 ==========
const cryptoList = document.querySelector("#crypto-list");
const searchInput = document.querySelector("#search-input");
const tabButtons = document.querySelectorAll(".tab-button");


// ========== 2. 상태 변수들 ==========

// API로 받은 코인 데이터 전체를 저장 (USDT만 필터링한 것)
let allCryptos = [];

// 현재 어떤 탭을 보고 있는지: "all" 또는 "favorites"
let currentTab = "all";

// 검색창에 입력된 글자
let searchKeyword = "";

// 관심 코인 목록 (LocalStorage에서 불러옴, 없으면 빈 배열)
// LocalStorage는 글자만 저장 가능 → JSON.parse로 배열로 되돌림
let favorites = JSON.parse(localStorage.getItem("favorites")) || [];


// ========== 3. Binance API에서 데이터 가져오기 ==========

// async/await: API처럼 "시간이 걸리는 작업"을 다룰 때 쓰는 문법.
// 결과가 올 때까지 기다렸다가 다음 줄로 넘어가게 해준다.
async function fetchData() {
    try {
        // fetch: 인터넷에서 데이터를 받아오는 명령
        const response = await fetch("https://api4.binance.com/api/v3/ticker/24hr");

        // 응답을 JSON(자바스크립트가 이해할 수 있는 데이터)으로 변환
        const data = await response.json();

        // USDT로 끝나는 코인만 골라낸다 (예: BTCUSDT, ETHUSDT)
        // filter: 조건에 맞는 것만 남기는 배열 메서드
        allCryptos = data.filter(function (coin) {
            return coin.symbol.endsWith("USDT");
        });

        // 화면을 다시 그린다
        render();
    } catch (error) {
        // 인터넷 끊김 등 오류가 나도 프로그램이 멈추지 않게 처리
        console.log("API 요청 실패:", error);
    }
}


// ========== 4. 화면에 코인 목록 그리기 ==========

function render() {
    // 기존 행들을 다 지운다 (안 그러면 매초 중복으로 쌓임)
    cryptoList.innerHTML = "";

    // 현재 탭과 검색어에 맞게 보여줄 코인을 추린다
    let coinsToShow = allCryptos;

    // "관심항목" 탭이면 favorites에 있는 것만 남긴다
    if (currentTab === "favorites") {
        coinsToShow = coinsToShow.filter(function (coin) {
            return favorites.includes(coin.symbol);
        });
    }

    // 검색어가 있으면 그 글자가 포함된 심볼만 남긴다
    if (searchKeyword !== "") {
        coinsToShow = coinsToShow.filter(function (coin) {
            // toUpperCase로 둘 다 대문자로 맞춰 비교 → "eth"든 "ETH"든 검색됨
            return coin.symbol.toUpperCase().includes(searchKeyword.toUpperCase());
        });
    }

    // 추려진 코인들을 한 줄씩 표에 추가
    for (let i = 0; i < coinsToShow.length; i++) {
        const coin = coinsToShow[i];

        // 변동률이 양수인지 음수인지에 따라 CSS 클래스 결정
        const changePercent = parseFloat(coin.priceChangePercent);
        const colorClass = changePercent >= 0 ? "positive" : "negative";
        const sign = changePercent >= 0 ? "+" : ""; // 양수일 때만 + 붙이기 (음수는 자동으로 - 붙음)

        // 별표가 노란색이어야 하는지 확인
        const isFavorite = favorites.includes(coin.symbol);
        const starClass = isFavorite ? "star active" : "star";
        const starSymbol = isFavorite ? "★" : "☆";

        // 표 한 행(tr)을 HTML 문자열로 만들어서 추가
        // 백틱(`)을 쓰면 ${변수} 형태로 값을 끼워넣을 수 있다 (템플릿 리터럴)
        const row = `
            <tr>
                <td><span class="${starClass}" data-symbol="${coin.symbol}">${starSymbol}</span></td>
                <td><strong>${coin.symbol}</strong></td>
                <td>${parseFloat(coin.lastPrice).toLocaleString()}</td>
                <td class="${colorClass}">${sign}${changePercent.toFixed(2)}%</td>
                <td>${parseFloat(coin.highPrice).toLocaleString()}</td>
                <td>${parseFloat(coin.lowPrice).toLocaleString()}</td>
            </tr>
        `;
        cryptoList.innerHTML += row;
    }
}


// ========== 5. 별표 클릭 이벤트 (관심 등록/해제) ==========

// 별표는 매초 새로 그려지기 때문에, 각 별표마다 따로 이벤트를 걸 수 없다.
// 그래서 부모인 cryptoList에 이벤트를 걸고, 클릭된 게 별표인지 확인한다.
// 이걸 "이벤트 위임"이라고 해요.
cryptoList.addEventListener("click", function (event) {
    // 클릭된 요소가 별표(.star 클래스)인지 확인
    if (event.target.classList.contains("star")) {
        // 별표의 data-symbol에 저장된 코인 이름 가져오기 (예: "BTCUSDT")
        const symbol = event.target.dataset.symbol;

        if (favorites.includes(symbol)) {
            // 이미 관심 목록에 있으면 → 빼기
            favorites = favorites.filter(function (s) {
                return s !== symbol;
            });
        } else {
            // 없으면 → 추가
            favorites.push(symbol);
        }

        // LocalStorage에 저장 (배열은 글자로 변환해서 저장: JSON.stringify)
        localStorage.setItem("favorites", JSON.stringify(favorites));

        // 화면 다시 그리기 (별표 색 바로 반영)
        render();
    }
});


// ========== 6. 검색창 이벤트 ==========

// "input" 이벤트: 검색창 글자가 바뀔 때마다 발생 (한 글자 입력될 때마다)
searchInput.addEventListener("input", function () {
    searchKeyword = searchInput.value;
    render();
});


// ========== 7. 탭 버튼 이벤트 ==========

for (let i = 0; i < tabButtons.length; i++) {
    tabButtons[i].addEventListener("click", function () {
        // 모든 탭에서 active 클래스 제거
        for (let j = 0; j < tabButtons.length; j++) {
            tabButtons[j].classList.remove("active");
        }
        // 클릭된 탭에만 active 추가
        tabButtons[i].classList.add("active");

        // 현재 탭 상태 업데이트 (HTML의 data-tab 값 사용)
        currentTab = tabButtons[i].dataset.tab;

        render();
    });
}


// ========== 8. 시작! ==========

// 첫 데이터 즉시 가져오기 (페이지 열자마자 보여주기 위해)
fetchData();

// 매초(1000ms)마다 fetchData() 실행 → 실시간 업데이트
setInterval(fetchData, 1000);