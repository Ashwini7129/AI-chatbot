let prompt = document.querySelector("#prompt");
let submitbtn = document.querySelector("#submit");
let chatContainer = document.querySelector(".chat-container");
let imagebtn = document.querySelector("#image");
let imageinput = document.querySelector("#image input");
let imagePreview = document.querySelector("#image-preview img");

const Api_Url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=AIzaSyCg4IsxWFPDlR-7I_d218YgmNTZ4ihB5Mk";

let user = {
    message: null,
    file: {
        mime_type: null,
        data: null
    }
};

async function generateResponse(aiChatBox) {
    let text = aiChatBox.querySelector(".ai-chat-area");

    let parts = user.file.data
        ? [{ text: user.message }, { inline_data: user.file }]
        : [{ text: user.message }];

    let requestOptions = {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [
                {
                    parts: parts
                }
            ]
        })
    };

    try {
        let response = await fetch(Api_Url, requestOptions);
        let data = await response.json();
        let apiResponse = data.candidates[0].content.parts[0].text.replace(/\\(.?)\\*/g, "$1").trim();
        text.innerHTML = apiResponse;
    } catch (error) {
        console.log(error);
        text.innerHTML = "❌ Error getting response from AI.";
    } finally {
        chatContainer.scrollTo({ top: chatContainer.scrollHeight, behavior: "smooth" });
        imagePreview.src = "";
        imagePreview.classList.remove("choose");
        user.file = {
            mime_type: null,
            data: null
        };
    }
}

function createChatBox(html, classes) {
    let div = document.createElement("div");
    div.innerHTML = html;
    div.classList.add(classes);
    return div;
}

function handlechatResponse(userMessage) {
    user.message = userMessage;

    let html = `
        <img src="user.png" alt="User" id="userImage" width="8%">
        <div class="user-chat-area">
            ${user.message}
            ${user.file.data ? `<br><img src="data:${user.file.mime_type};base64,${user.file.data}" class="chooseimg" />` : ""}
        </div>`;

    prompt.value = "";
    let userChatBox = createChatBox(html, "user-chat-box");
    chatContainer.appendChild(userChatBox);
    chatContainer.scrollTo({ top: chatContainer.scrollHeight, behavior: "smooth" });

    setTimeout(() => {
        let html = `
            <img src="ai.png" alt="AI" id="aiImage" width="10%">
            <div class="ai-chat-area">
                <img src="loading.webp" alt="Loading..." class="load" width="50px">
            </div>`;
        let aiChatBox = createChatBox(html, "ai-chat-box");
        chatContainer.appendChild(aiChatBox);
        generateResponse(aiChatBox);
    }, 600);
}

prompt.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && prompt.value.trim()) {
        handlechatResponse(prompt.value.trim());
    }
});

submitbtn.addEventListener("click", () => {
    if (prompt.value.trim()) {
        handlechatResponse(prompt.value.trim());
    }
});

imagebtn.addEventListener("click", () => {
    imageinput.click();
});

imageinput.addEventListener("change", () => {
    const file = imageinput.files[0];
    if (!file) return;

    let reader = new FileReader();
    reader.onload = (e) => {
        let base64string = e.target.result.split(",")[1];
        user.file = {
            mime_type: file.type,
            data: base64string
        };
        imagePreview.src = `data:${user.file.mime_type};base64,${user.file.data}`;
        imagePreview.classList.add("choose");
    };
    reader.readAsDataURL(file);
});
