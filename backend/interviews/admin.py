from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.models import User

from .models import JobApplication, Interview, UserProfile


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


class InterviewInline(admin.TabularInline):
    """
    Inline admin for Interview - shows interviews on JobApplication edit page.
    """
    model = Interview
    extra = 0
    readonly_fields = ["created_at"]
    fields = [
        "interview_type",
        "scheduled_date",
        "completed_date",
        "location",
        "interviewer_name",
        "outcome",
        "feedback",
        "reminder_sent",
        "created_at",
    ]


@admin.register(JobApplication)
class JobApplicationAdmin(admin.ModelAdmin):
    """
    Admin configuration for the JobApplication model.
    Customizes how applications appear and can be managed in Django Admin.
    """

    list_display = [
        "company_name",
        "position",
        "application_date",
        "application_status",
        "interview_count",
        "user",
    ]

    list_filter = ["application_status"]

    search_fields = ["company_name", "position"]

    date_hierarchy = "application_date"

    ordering = ["-created_at"]

    fieldsets = [
        ("Application Details", {"fields": ["user", "company_name", "position", "job_url"]}),
        ("Status", {"fields": ["application_date", "application_status"]}),
        ("Salary", {"fields": ["salary_min", "salary_max"], "classes": ["collapse"]}),
        ("Additional Info", {"fields": ["notes"], "classes": ["collapse"]}),
    ]

    list_editable = ["application_status"]

    inlines = [InterviewInline]

    def interview_count(self, obj):
        """Display the number of interviews for this application."""
        return obj.interviews.count()
    interview_count.short_description = "Interviews"


@admin.register(Interview)
class InterviewAdmin(admin.ModelAdmin):
    """
    Admin for Interview - manage individual interview events.
    """
    list_display = [
        "job_application",
        "interview_type",
        "scheduled_date",
        "location",
        "outcome",
        "reminder_sent",
        "created_at",
    ]
    list_filter = ["interview_type", "outcome", "location", "reminder_sent"]
    search_fields = [
        "job_application__company_name",
        "job_application__position",
        "interviewer_name",
    ]
    ordering = ["-scheduled_date"]
    date_hierarchy = "scheduled_date"

    fieldsets = [
        ("Interview Details", {
            "fields": ["job_application", "interview_type", "location"]
        }),
        ("Scheduling", {
            "fields": ["scheduled_date", "completed_date", "duration_minutes"]
        }),
        ("Interviewer", {
            "fields": ["interviewer_name", "interviewer_title"],
            "classes": ["collapse"]
        }),
        ("Result", {
            "fields": ["outcome", "feedback"]
        }),
        ("Notifications", {
            "fields": ["reminder_sent"]
        }),
    ]
