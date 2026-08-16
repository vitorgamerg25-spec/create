export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  const { instructions } = req.body;
  if (!instructions || typeof instructions !== "string") {
    return res.status(400).json({ error: "Instruções ausentes" });
  }

  try {
    const minimaxResponse = await fetch("https://api.minimax.io/v1/text/chatcompletion_v2", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.MINIMAX_API_KEY}`,
      },
      body: JSON.stringify({
        model: "MiniMax-M3",
        messages: [
          {
            role: "system",
            content:
              "Você gera apenas um trecho de código HTML autocontido (com <style> interno, sem <script>) para uma prévia curta de uma página, com base nas instruções do usuário. Responda SOMENTE com o código HTML, começando direto com <!DOCTYPE html>, sem explicações, sem comentários e sem crases de markdown.",
          },
          { role: "user", content: instructions },
        ],
        max_tokens: 1500,
        temperature: 0.7,
      }),
    });

    const data = await minimaxResponse.json();
    let html = data?.choices?.[0]?.message?.content || "";
    html = html.replace(/```html/gi, "").replace(/```/g, "").trim();

    if (!html.toLowerCase().includes("<html")) {
      return res.status(502).json({ error: "Resposta inesperada da IA" });
    }

    return res.status(200).json({ html });
  } catch (err) {
    return res.status(500).json({ error: "Falha ao gerar a prévia" });
  }
}
