from django.urls import path
from django.views.decorators.csrf import csrf_exempt

from .views import (
    FrontendView,
    LoginView,
    TarefaDetailView,
    TarefaListCreateView,
)


urlpatterns = [
    path("", FrontendView.home, name="home"),
    path("api/login/", csrf_exempt(LoginView.as_view()), name="api-login"),
    path("api/tarefas/", TarefaListCreateView.as_view(), name="api-tarefas"),
    path("api/tarefas/<int:pk>/", TarefaDetailView.as_view(), name="api-tarefa-detail"),
]
