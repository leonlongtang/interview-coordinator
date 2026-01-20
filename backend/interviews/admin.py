from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.models import User

from .models import Interview, InterviewRound, UserProfile


class UserProfileInline(admin.StackedInline):
    """
    Inline admin for UserProfile - shows profile settings on User edit page.
    """
    model = UserProfile
    can_delete = False
    verbose_name_plural = "Profile"


class UserAdmin(BaseUserAdmin):
    """
    Extended User admin that includes UserProfile inline.
    """
    inlines = [UserProfileInline]


# Re-register User with our custom admin
admin.site.unregister(User)
admin.site.register(User, UserAdmin)


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    """
    Admin for UserProfile - manage notification preferences.
    """
    list_display = [
        "user",
        "email_notifications_enabled",
        "reminder_days_before",
        "reminder_time",
    ]
    list_filter = ["email_notifications_enabled"]
    search_fields = ["user__username", "user__email"]


class InterviewRoundInline(admin.TabularInline):
    """
    Inline admin for InterviewRound - shows rounds on Interview edit page.
    """
    model = InterviewRound
    extra = 0  # Don't show empty forms by default
    readonly_fields = ["created_at"]
    fields = ["stage", "scheduled_date", "completed_date", "duration_minutes", "outcome", "notes", "created_at"]


@admin.register(Interview)
class InterviewAdmin(admin.ModelAdmin):
    """
    Admin configuration for the Interview model.
    Customizes how interviews appear and can be managed in Django Admin.
    """

    # Columns displayed in the list view
    list_display = [
        "company_name",
        "position",
        "interview_date",
        "interview_stage",
        "application_status",
        "status",
        "interview_type",
        "location",
        "reminder_sent",
    ]

    # Sidebar filters for quick filtering
    list_filter = ["status", "interview_stage", "application_status", "interview_type", "location", "reminder_sent"]

    # Fields that can be searched via the search box
    search_fields = ["company_name", "position"]

    # Enables date-based drill-down navigation
    date_hierarchy = "interview_date"

    # Orders by interview date (most recent first)
    ordering = ["-interview_date"]

    # Groups fields in the edit form for better organization
    fieldsets = [
        ("Interview Details", {"fields": ["user", "company_name", "position", "interview_date"]}),
        ("Pipeline", {"fields": ["interview_stage", "application_status", "application_date"]}),
        ("Classification", {"fields": ["interview_type", "status", "location"]}),
        ("Notifications", {"fields": ["reminder_sent"]}),
        ("Additional Info", {"fields": ["notes"], "classes": ["collapse"]}),
    ]

    # Makes the list view editable for quick status updates
    list_editable = ["status", "interview_stage", "application_status"]

    # Show interview rounds inline
    inlines = [InterviewRoundInline]


@admin.register(InterviewRound)
class InterviewRoundAdmin(admin.ModelAdmin):
    """
    Admin for InterviewRound - manage individual interview stages.
    """
    list_display = [
        "interview",
        "stage",
        "scheduled_date",
        "outcome",
        "duration_minutes",
        "created_at",
    ]
    list_filter = ["stage", "outcome"]
    search_fields = ["interview__company_name", "interview__position"]
    ordering = ["-scheduled_date"]
