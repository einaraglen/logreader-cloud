import { Signal as SignalData } from "../../parser/types";
import prisma from "../../services/prisma/client";
import { Signal, Extraction } from "@prisma/client";

export type ValueData = {
  signal_id: number;
  x: number;
  y: number;
};

class Writer {
  private static CHUNK_SIZE: number = 1000;

  public static async insert(data: Map<string, SignalData>) {
    const map = await prisma.$transaction(
      async (tx) => {
        const extraction = await tx.extraction.create({
          data: { result_id: 123 },
        });

        console.log("Inserting Extraction...");

        const signals = await Promise.all(
          this.signals(extraction, data).map(
            async (signal) => await tx.signal.create({ data: signal })
          )
        );

        console.log("Inserting Signals...");

        return new Map(signals.map((signal) => [signal.name, signal]));
      },
      {
        maxWait: 100000, // default: 2000
        timeout: 100000, // default: 5000
      }
    );

    console.log("Completed Extractin + Signals Transaction!");

    await Promise.all(this.chunks(map, data).map(
      async (chunk, index) => {
        await prisma.value.createMany({
          data: chunk,
        })
        console.log(`Inserted chunk ${index + 1}!`)
      }
    ))

    console.log("Completed Write!");

  }

  private static signals(
    extraction: Extraction,
    data: Map<string, SignalData>
  ): Signal[] {
    return Array.from(data).map(([key, value]) => {
      const current = { ...value };
      const times = Array.from(current.values.keys());
      delete (current as any).id
      delete (current as any).values;
      delete (current as any).type;

      return {
        ...current,
        extraction_id: extraction.id,
        from: times.at(0) || -1,
        to: times.at(-1) || -1,
      } as any;
    });
  }

  private static chunks(
    map: Map<string, Signal>,
    data: Map<string, SignalData>
  ) {
    const chunks: ValueData[] = [];

    data.forEach((signal, key) => {
      const { id: signal_id } = map.get(signal.name)!;
      const values = Array.from(signal.values).map(([x, y]) => ({
        x,
        y,
        signal_id,
      }));

      for (let i = 0; i < values.length; i += this.CHUNK_SIZE) {
        const chunk: any = values.slice(i, i + this.CHUNK_SIZE);
        chunks.push(chunk);
      }
    });

    return chunks;
  }
}

export default Writer;
