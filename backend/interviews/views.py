from rest_framework import viewsets

from .models import Interview
from .serializers import InterviewSerializer


class InterviewViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Interview CRUD operations.
    
    ModelViewSet automatically provides:
    - list()   -> GET /interviews/        (list all)
    - create() -> POST /interviews/       (create new)
    - retrieve() -> GET /interviews/{id}/ (get one)
    - update() -> PUT /interviews/{id}/   (full update)
    - partial_update() -> PATCH /interviews/{id}/ (partial update)
    - destroy() -> DELETE /interviews/{id}/ (delete)
    """

    queryset = Interview.objects.all()
    serializer_class = InterviewSerializer
