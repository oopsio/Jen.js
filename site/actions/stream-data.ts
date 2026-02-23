/*
 * Example server action: streaming response
 */

import type { ServerActionContext } from "jenjs";

export const metadata = {
  name: "streamData",
  description: "Stream data back to client",
};

export default async (ctx: ServerActionContext) => {
  const stream = ctx.stream();

  // Simulate streaming large dataset
  for (let i = 0; i < 5; i++) {
    stream.writeJSON({
      chunk: i,
      data: {
        id: i,
        message: `Processing item ${i}`,
        timestamp: new Date().toISOString(),
      },
    });

    // Simulate async work
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  stream.close();
};
