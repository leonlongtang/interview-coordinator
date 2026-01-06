from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from .models import Interview
from .serializers import InterviewSerializer


class InterviewViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Interview CRUD operations.
    
    ModelViewSet automatically provides:
    - list()   -> GET /interviews/        (list all for current user)
    - create() -> POST /interviews/       (create new, auto-assigns user)
    - retrieve() -> GET /interviews/{id}/ (get one, only if owned by user)
    - update() -> PUT /interviews/{id}/   (full update, only if owned)
    - partial_update() -> PATCH /interviews/{id}/ (partial update, only if owned)
    - destroy() -> DELETE /interviews/{id}/ (delete, only if owned)
    
    Security: Users can only see and modify their own interviews.
    """

    serializer_class = InterviewSerializer
    # Require authentication for all operations on this viewset
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """
        Filter interviews to only return those belonging to the current user.
        This ensures users can never access other users' interviews.
        """
        return Interview.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        """
        Automatically set the user field when creating a new interview.
        The user doesn't need to (and can't) specify themselves - it's automatic.
        """
        serializer.save(user=self.request.user)
