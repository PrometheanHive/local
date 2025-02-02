from django.urls import path

from . import views

app_name = "helloWorld"
urlpatterns = [
    # ex: /helloWorld/
    path("", views.index, name="index"),

    #testers
    path("helloJSON", views.helloJSON, name="helloJSON"),
    path("helloHTML", views.helloHTML, name="helloHTML"),

    #parameterized options
    # ex: /helloWorld/5/
    path("<int:question_id>/", views.detail, name="question_detail"),
    # ex: /helloWorld/5/results/
    path("<int:question_id>/results/", views.results, name="question_results"),
    # ex: /helloWorld/5/vote/
    path("<int:question_id>/vote/", views.vote, name="vote"),

]