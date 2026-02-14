/*
 * This file is part of Jen.js.
 * Copyright (C) 2026 oopsio
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

// Stylized CLI Banner for Jen.js
// Matches the visual style requested (Purple/Cyan gradient feel)

const RES = "\x1b[0m";
const PURPLE = "\x1b[38;2;200;128;255m"; // #C880FF
const CYAN = "\x1b[38;2;86;194;201m"; // #56C2C9
const GRAY = "\x1b[90m";
const BOLD = "\x1b[1m";
const DIM = "\x1b[2m";

export function printBanner(
  port: number,
  env: string,
  version: string = "1.0.0",
) {
  // Clear screen mostly
  // console.log("\x1b[2J\x1b[3J\x1b[H");

  console.log();
  console.log(`  ${PURPLE}       __               ${CYAN}   _     ${RES}`);
  console.log(`  ${PURPLE}      / /__  ____       ${CYAN}  (_)____${RES}`);
  console.log(`  ${PURPLE} __  / / _ \/ __ \      ${CYAN} / / ___/${RES}`);
  console.log(
    `  ${PURPLE}/ /_/ /  __/ / / /${GRAY}_____${CYAN}/ / (__  )${RES}`,
  );
  console.log(`  ${PURPLE}\____/\___/_/ /_/${GRAY}_____/${CYAN}_/____/ ${RES}`);
  console.log();
  console.log(`  ${GRAY}Jen.js Framework ${DIM}v${version}${RES}`);
  console.log();
  console.log(
    `  ${GRAY}➜${RES}  ${BOLD}Local:${RES}   ${CYAN}http://localhost:${port}/${RES}`,
  );
  console.log(`  ${GRAY}➜${RES}  ${BOLD}Mode:${RES}    ${PURPLE}${env}${RES}`);
  console.log();
}
