# 9. Fluxo de Telas

## Identidade visual (paleta e tipografia)

| Uso | Cor |
|-----|-----|
| Títulos, ícone/logo | Azul royal `#14275E` |
| Ações e destaques (botões primários) | Azul vibrante `#2F6FED` |
| Fundo | Branco `#FFFFFF` |
| Moldura dos cards | Bege claro `#F1E8D8` |
| Interior do card | Off-white `#FFFDF8` |
| Texto de apoio | Cinza-escuro `#2E2E2E` |

Fundo decorativo opcional: padrão geométrico de linhas/pontos azuis translúcidos sobre branco, usado com moderação (nunca atrás de texto ou botões).

**Tipografia**: títulos em bold arredondado, azul royal; corpo em sans-serif limpa, alto contraste, tamanho generoso.

**Princípios**: alto contraste, ícones universais, áreas de toque grandes, tom acolhedor e digno — nunca infantilizado.

## Componente reutilizável: Card

Moldura bege arredondada com sombra suave; ilustração 4:3 no topo (estilo flat/vetorial, cena hospitalar); frase curta centralizada abaixo; rodapé com logos (SINAI + UFPE + Hospital das Clínicas + HUBRASIL). Estados:
- **Normal**: moldura bege padrão.
- **Selecionado**: borda azul vibrante.
- **Favorito**: ícone de estrela preenchida no canto.

Esse componente é a base visual da biblioteca de sintomas (cada categoria/local/intensidade é um Card).

## Tela do Paciente

### Estado 1 — Aguardando

```
┌───────────────────────────────┐
│           SINAI (logo)         │   azul royal
│                                 │
│      [Avatar Libras — parado]  │
│                                 │
│   "Aguardando o profissional"  │  cinza-escuro
└───────────────────────────────┘
```

### Estado 2 — Recebendo pergunta do médico

```
┌───────────────────────────────┐
│           SINAI                │
│                                 │
│      [Avatar Libras — sinal]   │
│                                 │
│   O médico perguntou:          │
│   "Você está com dor?"         │  destaque em card off-white
│                                 │
│   [🔁 Repetir tradução]        │  botão secundário
└───────────────────────────────┘
```

### Estado 3 — Resposta binária (sim/não)

```
┌───────────────────────────────┐
│   "Você está com dor?"         │
│                                 │
│   [👍 Sim]      [👎 Não]       │  botões grandes, azul vibrante
└───────────────────────────────┘
```

### Estado 4 — Biblioteca visual (categoria → local → intensidade)

```
Passo 1 — Categoria         Passo 2 — Local          Passo 3 — Intensidade
┌─────┐ ┌─────┐             ┌─────┐ ┌─────┐          ┌─────┐ ┌─────┐ ┌─────┐
│ Dor │ │ Mal- │            │Cabeça│ │Barriga│        │Pouca│ │Média│ │Muita│
│Card │ │estar │            │ Card │ │ Card  │        │Card │ │Card │ │Card │
└─────┘ └─────┘             └─────┘ └─────┘          └─────┘ └─────┘ └─────┘
(cards com ilustração, seleção = borda azul)
```

Ao concluir os 3 passos, o sistema monta a frase e envia — sem necessidade de teclado.

## Tela do Médico (Dashboard)

```
┌──────────────────────────────────────────────┐
│  SINAI          Paciente: [pacienteRef]        │  header azul royal
├──────────────────────────────────────────────┤
│  Histórico                                     │
│  ┌────────────────────────────────────────┐   │
│  │ Médico:   "Quando começou?"             │   │
│  │ Paciente: "Ontem" (via biblioteca visual)│   │
│  └────────────────────────────────────────┘   │
│                                                 │
│  [ Digite aqui...                    ] [🎤] [Enviar] │
└──────────────────────────────────────────────┘
```

- Campo de texto + botão de microfone (Web Speech API) + botão enviar (azul vibrante).
- Histórico rolável, remetente identificado, ordem cronológica.
- Indicador discreto de status da sessão (aguardando / em andamento / finalizado).

## Navegação entre telas

```
/atendimentos/novo (médico cria atendimento)
        │
        ▼
/atendimento/:id/medico  ←── WebSocket (sala) ──→  /atendimento/:id/paciente
        │                                                   │
        └──────────────── ambos finalizam ao final ─────────┘
```

O link/QR code para `/atendimento/:id/paciente` é gerado ao criar o atendimento, para ser aberto no monitor/tablet do paciente.
