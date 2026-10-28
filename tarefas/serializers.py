from rest_framework import serializers

from .models import Tarefa


class TarefaSerializer(serializers.ModelSerializer):
    usuario = serializers.ReadOnlyField(source="usuario.username")

    class Meta:
        model = Tarefa
        fields = [
            "id",
            "titulo",
            "descricao",
            "concluida",
            "prioridade",
            "data_criacao",
            "data_limite",
            "usuario",
        ]
        read_only_fields = ["id", "data_criacao", "usuario"]
