from django.shortcuts import render, get_object_or_404
from django.http import HttpResponse, JsonResponse, Http404
from .models import Question

# Create your views here.

def index(request):
    latest_question_list = Question.objects.order_by("-pub_date")[:5]
    context = {"latest_question_list": latest_question_list}
    return render(request, "helloWorld/index.html", context)


def helloHTML(request):
    return HttpResponse("Hello World - ITS ALIVE")

def helloJSON(request):
    return JsonResponse({'hello':{'world' : 'its alive'}})

def detail(request, question_id):
    question =  question = get_object_or_404(Question, pk=question_id)
    return render(request, "helloWorld/detail.html", {"question": question})


def results(request, question_id):
    response = "You're looking at the results of question %s."
    return HttpResponse(response % question_id)


def vote(request, question_id):
    return HttpResponse("You're voting on question %s." % question_id)