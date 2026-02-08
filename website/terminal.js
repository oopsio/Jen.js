const terminalBody = document.querySelector(".terminal-body");

const commands = ["npm create jen-app@latest"];

let i = 0;

function typeCommand() {
  if (i >= commands.length) return;
  const p = document.createElement("p");
  const span = document.createElement("span");
  span.className = "prompt";
  span.textContent = "user@computer:~$";
  p.appendChild(span);
  p.appendChild(document.createTextNode(" "));
  terminalBody.appendChild(p);

  let j = 0;

  function typeChar() {
    if (j < commands[i].length) {
      p.appendChild(document.createTextNode(commands[i][j]));
      j++;
      setTimeout(typeChar, 50);
    } else {
      // 1. Capture the current command text before the loop index 'i' changes
      const currentCommand = commands[i];

      // 2. Create the icon
      const icon = document.createElement("i");
      icon.className = "bi bi-copy";
      icon.style.marginLeft = "10px";
      icon.style.cursor = "pointer";

      // 3. Add the click event listener to copy the text
      icon.addEventListener("click", () => {
        navigator.clipboard.writeText(currentCommand);

        // Optional: Visual feedback (changes icon to a checkmark for 1 second)
        icon.className = "bi bi-check";
        setTimeout(() => {
          icon.className = "bi bi-copy";
        }, 1000);
      });

      // 4. Append to paragraph
      p.appendChild(icon);

      i++;
      setTimeout(typeCommand, 300);
    }
  }
  typeChar();
}

typeCommand();
