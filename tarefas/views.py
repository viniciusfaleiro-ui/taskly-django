from django.contrib.auth import authenticate
from django.shortcuts import render
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from rest_framework import generics, status
from rest_framework.authentication import TokenAuthentication
from rest_framework.authtoken.models import Token
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Tarefa
from .serializers import TarefaSerializer


class FrontendView:
    @staticmethod
    def home(request):
        return render(request, "tarefas/index.html")


@method_decorator(csrf_exempt, name="dispatch")
class LoginView(ObtainAuthToken):
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        if response.status_code != status.HTTP_200_OK:
            return response

        user = authenticate(
            username=request.data.get("username"),
            password=request.data.get("password"),
        )
        token, _ = Token.objects.get_or_create(user=user)
        return Response(
            {"token": token.key, "usuario": user.username},
            status=status.HTTP_200_OK,
        )


class TarefaListCreateView(generics.ListCreateAPIView):
    serializer_class = TarefaSerializer
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = Tarefa.objects.filter(usuario=self.request.user)
        concluida = self.request.query_params.get("concluida")
        prioridade = self.request.query_params.get("prioridade")

        if concluida in {"true", "false"}:
            queryset = queryset.filter(concluida=concluida == "true")
        if prioridade:
            queryset = queryset.filter(prioridade=prioridade.upper())
        return queryset

    def perform_create(self, serializer):
        serializer.save(usuario=self.request.user)


class TarefaDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = TarefaSerializer
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Tarefa.objects.filter(usuario=self.request.user)
