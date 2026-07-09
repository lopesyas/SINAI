"""
Simplificador clínico de texto — regras + dicionário curado.
Transforma linguagem técnica em linguagem cotidiana acessível antes
de enviar ao widget VLibras. Sem IA generativa: só substituições
controladas e auditáveis, sem risco de alucinação clínica.
"""

import re

# ---------------------------------------------------------------------------
# Dicionário de substituições: expressão clínica → linguagem cotidiana
# Ordenado do mais específico para o mais genérico para evitar colisões.
# ---------------------------------------------------------------------------
DICIONARIO = [
    # Sintomas e queixas
    ("desconforto abdominal", "dor na barriga"),
    ("dor abdominal", "dor na barriga"),
    ("dor epigástrica", "dor no estômago"),
    ("dor torácica", "dor no peito"),
    ("dor precordial", "dor no peito"),
    ("dispneia", "falta de ar"),
    ("dispneico", "com falta de ar"),
    ("cefaleia", "dor de cabeça"),
    ("náusea", "enjoo"),
    ("náuseas", "enjoos"),
    ("vômito", "vômito"),  # já cotidiano
    ("êmese", "vômito"),
    ("diarreia", "diarreia"),
    ("constipação", "prisão de ventre"),
    ("obstipação", "prisão de ventre"),
    ("febre", "febre"),
    ("hipertermia", "febre alta"),
    ("tontura", "tontura"),
    ("vertigem", "tontura"),
    ("síncope", "desmaio"),
    ("lipotimia", "quase desmaio"),
    ("palpitações", "coração acelerado"),
    ("taquicardia", "coração acelerado"),
    ("bradicardia", "coração lento"),
    ("edema", "inchaço"),
    ("edema de membros inferiores", "inchaço nas pernas"),
    ("prurido", "coceira"),
    ("eritema", "vermelhidão"),
    ("exantema", "manchas na pele"),
    ("mialgia", "dor muscular"),
    ("artralgia", "dor nas juntas"),
    ("lombalgia", "dor nas costas"),
    ("dorsalgia", "dor nas costas"),
    ("anorexia", "falta de apetite"),
    ("hiporexia", "pouco apetite"),
    ("poliúria", "fazendo muito xixi"),
    ("disúria", "dor ao urinar"),
    ("hematúria", "sangue na urina"),
    ("hemoptise", "tosse com sangue"),
    ("epistaxe", "sangramento no nariz"),
    ("melena", "fezes escuras com sangue"),
    ("enterorragia", "sangramento no intestino"),

    # Regiões do corpo
    ("região epigástrica", "parte de cima da barriga"),
    ("hipocôndrio direito", "lado direito da barriga"),
    ("hipocôndrio esquerdo", "lado esquerdo da barriga"),
    ("fossa ilíaca direita", "lado direito baixo da barriga"),
    ("fossa ilíaca esquerda", "lado esquerdo baixo da barriga"),
    ("membros inferiores", "pernas"),
    ("membros superiores", "braços"),
    ("região lombar", "parte de baixo das costas"),
    ("região cervical", "pescoço"),
    ("região torácica", "peito e costas"),
    ("região pélvica", "barriga baixa"),

    # Termos de tempo/frequência
    ("há quanto tempo", "desde quando"),
    ("início dos sintomas", "quando começou"),
    ("sintomas", "problema"),
    ("sintoma", "problema"),
    ("quadro clínico", "sua situação de saúde"),
    ("diagnóstico", "o que você tem"),
    ("prognóstico", "como vai ficar"),
    ("tratamento", "tratamento"),
    ("medicamento", "remédio"),
    ("medicamentos", "remédios"),
    ("medicação", "remédio"),
    ("prescrição", "receita"),
    ("dose", "quantidade do remédio"),
    ("posologia", "como tomar o remédio"),
    ("via oral", "pela boca"),
    ("jejum", "sem comer ou beber"),
    ("internação", "ficar no hospital"),
    ("alta hospitalar", "ir para casa"),
    ("retorno", "voltar ao médico"),
    ("exame de sangue", "exame de sangue"),
    ("hemograma", "exame de sangue completo"),
    ("radiografia", "raio-x"),
    ("ultrassonografia", "ultrassom"),
    ("tomografia", "tomografia"),
]


def simplificar(texto: str) -> str:
    """
    Aplica as substituições do dicionário ao texto, preservando o sentido clínico.
    Retorna o texto simplificado. Se nenhuma substituição ocorrer, retorna o original.
    """
    if not texto:
        return texto

    resultado = texto

    for expressao, substituto in DICIONARIO:
        # Substituição case-insensitive, palavra/frase inteira
        padrao = re.compile(re.escape(expressao), re.IGNORECASE)
        resultado = padrao.sub(substituto, resultado)

    return resultado


def simplificar_para_exibicao(original: str) -> dict:
    """
    Retorna original e simplificado juntos para exibição ao médico.
    """
    simplificado = simplificar(original)
    return {
        "original": original,
        "simplificado": simplificado,
        "foi_alterado": simplificado.lower() != original.lower(),
    }
