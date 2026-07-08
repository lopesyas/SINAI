# 6. User Stories

Formato: "Como [papel], quero [ação], para [benefício]." + critérios de aceite.

## Médico

### US-01 — Enviar pergunta por texto
Como médico, quero digitar uma pergunta para o paciente, para que ela seja traduzida e exibida em Libras no monitor do paciente.

**Critérios de aceite:**
- Ao digitar e enviar, a mensagem aparece no monitor do paciente em até 3 segundos.
- A mensagem enviada aparece no histórico do meu próprio monitor também.

### US-02 — Enviar pergunta por voz
Como médico, quero falar em vez de digitar, para agilizar o atendimento sem tirar as mãos do exame/paciente.

**Critérios de aceite:**
- Ao pressionar o botão de microfone e falar, o texto reconhecido aparece no meu campo antes de ser enviado, para eu poder corrigir.
- Só é enviado ao paciente depois da minha confirmação.

### US-03 — Ver resposta simplificada sem perder o sentido clínico
Como médico, quero que a simplificação do meu texto não altere o significado clínico da minha pergunta, para não comprometer o atendimento.

**Critérios de aceite:**
- O texto simplificado enviado ao VLibras é exibido também no meu monitor, para eu conferir o que o paciente está recebendo.

### US-04 — Receber resposta estruturada do paciente
Como médico, quero receber a resposta do paciente em texto claro, para entender o sintoma relatado sem depender de interpretação.

**Critérios de aceite:**
- A resposta aparece no meu histórico como frase completa (ex.: "Paciente relata muita dor na cabeça.").
- Aparece com timestamp.

## Paciente

### US-05 — Visualizar pergunta em Libras
Como paciente surdo, quero ver a pergunta do médico traduzida em Libras, para entender o que está sendo perguntado sem depender de um intérprete presente.

**Critérios de aceite:**
- O avatar/vídeo em Libras é exibido de forma central e legível, sem exigir rolagem de tela.
- Existe uma opção de repetir a tradução.

### US-06 — Responder com poucos toques
Como paciente, quero responder através de botões grandes e visuais, para me comunicar mesmo sem digitar ou sem domínio de português escrito.

**Critérios de aceite:**
- Fluxo de resposta (categoria → local → intensidade) completo em no máximo 3 toques.
- Botões com contraste alto e ícones reconhecíveis, seguindo a paleta definida.

### US-07 — Responder sim/não rapidamente
Como paciente, quero responder perguntas simples de sim/não com um único toque, para agilizar perguntas objetivas.

**Critérios de aceite:**
- Botões "Sim" / "Não" sempre visíveis quando a pergunta do médico for classificada como binária.

### US-08 — Ter certeza de que fui entendido
Como paciente, quero ver a confirmação de que minha resposta foi enviada e recebida pelo médico, para ter segurança de que a comunicação funcionou.

**Critérios de aceite:**
- Indicador visual de "enviado" após cada resposta.

## Transversal (ambos os papéis)

### US-09 — Histórico do atendimento
Como médico ou paciente, quero ver o histórico da conversa durante o atendimento, para não perder contexto do que já foi dito.

**Critérios de aceite:**
- Histórico visível na tela durante toda a sessão, em ordem cronológica.
- Histórico persiste mesmo se a página for recarregada (mesma sessão de atendimento).
