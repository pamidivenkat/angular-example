import { isNullOrUndefined } from 'util';
import { AeInformationBarItemType } from '../../atlas-elements/common/ae-informationbar-itemtype.enum'

export class IConHelper {
    static GetByInformationBarItemType(type: AeInformationBarItemType): string {
        var iconText;
        switch (type) {
            case AeInformationBarItemType.DocumentsAwaiting: {
                iconText = "icon-to-review";
                break;
            }
            case AeInformationBarItemType.HolidayCountdown: {
                iconText = "icon-palm";
                break;
            }
            case AeInformationBarItemType.HolidaysAvailable: {
                iconText = "icon-holidays-absence";
                break;
            }
            case AeInformationBarItemType.TasksToComplete: {
                iconText = "icon-checklist";
                break;
            }
            case AeInformationBarItemType.TeamHolidays: {
                iconText = "icon-people";
                break;
            }
            case AeInformationBarItemType.TrainingCourses: {
                iconText = "icon-education";
                break;
            }
        }
        return iconText;
    }

    static GetByInformationBarItemTooltip(type: AeInformationBarItemType, count: any): string {
        let tooltip;
        if (isNullOrUndefined(count))
            count = 0;
        switch (type) {
            case AeInformationBarItemType.DocumentsAwaiting: {
                if (count === 0) {
                    tooltip = "INFORMATIONBAR.Up_to_date_tooltip";
                } else {
                    tooltip = "INFORMATIONBAR.Documents_awaiting_tooltip";
                }
                break;
            }
            case AeInformationBarItemType.HolidayCountdown: {
                if (count === 0) {
                    tooltip = "INFORMATIONBAR.Holiday_count_down_Uptodate_tooltip";
                } else {
                    tooltip = "INFORMATIONBAR.Holiday_count_down_tooltip";
                }
                break;
            }
            case AeInformationBarItemType.HolidaysAvailable: {
                tooltip = "INFORMATIONBAR.Holidays_available_tooltip";
                break;
            }
            case AeInformationBarItemType.TasksToComplete: {
                if (count === 0) {
                    tooltip = "INFORMATIONBAR.Up_to_date_tooltip";
                } else {
                    tooltip = "INFORMATIONBAR.Tasks_to_complete_tooltip";
                }
                break;
            }
            case AeInformationBarItemType.TeamHolidays: {
                tooltip = "INFORMATIONBAR.Team_holidays_tooltip";
                break;
            }
            case AeInformationBarItemType.TrainingCourses: {
                if (count === 0) {
                    tooltip = "INFORMATIONBAR.Up_to_date_tooltip";
                } else {
                    tooltip = "INFORMATIONBAR.Training_course_tooltip";
                }
                break;
            }
            case AeInformationBarItemType.NewTasks:
                {
                    if (count === 0) {
                        tooltip = "TASKS.No_new_tasks_tooltip";
                    } else {
                        tooltip = "INFORMATIONBAR.new_tasks_tooltip";
                    }
                    break;
                }
            case AeInformationBarItemType.OverdueTasks:
                {
                    if (count === 0) {
                        tooltip = "TASKS.No_overdue_tasks_tooltip";
                    } else {
                        tooltip = "INFORMATIONBAR.Overdue_tasks_tooltip";
                    }
                    break;
                }
            case AeInformationBarItemType.IncompleteTasks: {
                if (count === 0) {
                    tooltip = "TASKS.No_incomplete_tasks_tooltip";
                } else {
                    tooltip = "INFORMATIONBAR.Incomplete_tasks_tooltip";
                }
                break;
            }
            case AeInformationBarItemType.DueTodayTask:
                {
                    if (count === 0) {
                        tooltip = "TASKS.No_duetoday_tasks_tooltip";
                    } else {
                        tooltip = "INFORMATIONBAR.Duetoday_tasks_tooltip";
                    }
                    break;
                }
            case AeInformationBarItemType.DueThisWeekTasks: {
                if (count === 0) {
                    tooltip = "TASKS.No_duethisweek_tasks_tooltip";
                } else {
                    tooltip = "INFORMATIONBAR.Duethisweek_tasks_tooltip";
                }
                break;
            }
            case AeInformationBarItemType.DueNextWeekTasks: {
                if (count === 0) {
                    tooltip = "TASKS.No_duenextweek_tasks_tooltip";
                } else {
                    tooltip = "INFORMATIONBAR.Duenextweek_tasks_tooltip";
                }
                break;
            }
            case AeInformationBarItemType.HolidaysRequested: {
                if (count === 0) {
                    tooltip = "INFORMATIONBAR.Up_to_date_tooltip";
                } else {
                    tooltip = "INFORMATIONBAR.Holidays_Requested_tooltip";
                }
                break;
            }
            case AeInformationBarItemType.ManageTeam: {

                tooltip = "INFORMATIONBAR.Manage_team_tooltip";

                break;
            }
            case AeInformationBarItemType.MyTeamTasks: {
                if (count === 0) {
                    tooltip = "INFORMATIONBAR.EveryOne_Up_to_date_tooltip";
                } else {
                    tooltip = "INFORMATIONBAR.My_team_tasks_tooltip";
                }
                break;
            }
            case AeInformationBarItemType.AssignedChecklists: {
                if (count === 0) {
                    tooltip = "INFORMATIONBAR.Up_to_date_tooltip";
                } else {
                    tooltip = "INFORMATIONBAR.Checklists_assigned_tooltip";
                }
                break;
            }
            case AeInformationBarItemType.EmployeesAbsentToday: {
                if (count === 0) {
                    tooltip = "INFORMATIONBAR.No_EmployeesAbsentToday_tooltip";
                } else {
                    tooltip = "INFORMATIONBAR.EmployeesAbsentToday_tooltip";
                }
                break;
            }
            case AeInformationBarItemType.RiskAssessments: {
                if (count === 0) {
                    tooltip = "INFORMATIONBAR.No_RiskAssessments_tooltip";
                } else {
                    tooltip = "INFORMATIONBAR.RiskAssessments_tooltip";
                }
                break;
            }
            case AeInformationBarItemType.OutstandingTraining: {
                if (count === 0) {
                    tooltip = "INFORMATIONBAR.Everything_uptodate_tooltip";
                } else {
                    tooltip = "INFORMATIONBAR.Outstanding_trainings_tooltip";
                }
                break;
            }
            case AeInformationBarItemType.HeadCount: {
                tooltip = "INFORMATIONBAR.headCount_reports_tooltip";
                break;
            }
            case AeInformationBarItemType.SickDaysCount: {
                tooltip = "INFORMATIONBAR.sickDays_reports_tooltip";
                break;
            }
            case AeInformationBarItemType.PeopleSickCount: {
                tooltip = "INFORMATIONBAR.peopleSick_reports_tooltip";
                break;
            }
            case AeInformationBarItemType.MaleCount: {
                tooltip = "INFORMATIONBAR.maleCount_reports_tooltip";
                break;
            }
            case AeInformationBarItemType.FemaleCount: {
                tooltip = "INFORMATIONBAR.femaleCount_reports_tooltip";
                break;
            }
            case AeInformationBarItemType.IncidentsCount: {
                tooltip = "INFORMATIONBAR.incidentsCount_reports_tooltip";
                break;
            }
            case AeInformationBarItemType.DaysSinceLastIncident:
                {
                    if (count > 0) {
                        tooltip = 'INCIDENT_LOG.DAYS_SINCE_LAST_INCIDENT_TOOLTIP';
                    } else {
                        tooltip = 'INCIDENT_LOG.DAYS_SINCE_LAST_INCIDENT_ZERO_TOOLTIP';
                    }
                }
                break;
            case AeInformationBarItemType.NearMisses:
                {
                    if (count > 0) {
                        tooltip = 'INCIDENT_LOG.NEAR_MISSES_TOOLTIP';
                    } else {
                        tooltip = 'INCIDENT_LOG.NEAR_MISSES_ZERO_TOOLTIP';
                    }
                }
                break;
            case AeInformationBarItemType.Fatalities:
                {
                    if (count > 0) {
                        tooltip = 'INCIDENT_LOG.FATALITIES_TOOLTIP';
                    } else {
                        tooltip = 'INCIDENT_LOG.FATALITIES_ZERO_TOOLTIP';
                    }
                }
                break;
            case AeInformationBarItemType.Diseases:
                {
                    if (count > 0) {
                        tooltip = 'INCIDENT_LOG.DISEASES_TOOLTIP';
                    } else {
                        tooltip = 'INCIDENT_LOG.DISEASES_ZERO_TOOLTIP';
                    }
                }
                break;
            case AeInformationBarItemType.Injuries:
                {
                    if (count > 0) {
                        tooltip = 'INCIDENT_LOG.INJURIES_TOOLTIP';
                    } else {
                        tooltip = 'INCIDENT_LOG.INJURIES_ZERO_TOOLTIP';
                    }
                }
                break;
            case AeInformationBarItemType.Behavioural:
                {
                    if (count > 0) {
                        tooltip = 'INCIDENT_LOG.BEHAVIOURAL_TOOLTIP';
                    } else {
                        tooltip = 'INCIDENT_LOG.BEHAVIOURAL_ZERO_TOOLTIP';
                    }
                }
                break;
            case AeInformationBarItemType.Dangerous:
                {
                    if (count > 0) {
                        tooltip = 'INCIDENT_LOG.DANGEROUS_TOOLTIP';
                    } else {
                        tooltip = 'INCIDENT_LOG.DANGEROUS_ZERO_TOOLTIP';
                    }
                }
                break;
            case AeInformationBarItemType.Environmental:
                {
                    if (count > 0) {
                        tooltip = 'INCIDENT_LOG.ENVIRONMENTAL_TOOLTIP';
                    } else {
                        tooltip = 'INCIDENT_LOG.ENVIRONMENTAL_ZERO_TOOLTIP';
                    }
                }
                break;
            case AeInformationBarItemType.PendingIncidents:
                {
                    if (count > 0) {
                        tooltip = 'INCIDENT_LOG.PENDING_INCIDENTS_TOOLTIP';
                    } else {
                        tooltip = 'INCIDENT_LOG.PENDING_INCIDENTS_ZERO_TOOLTIP';
                    }
                    break;
                }
            case AeInformationBarItemType.SitesCount:
                {
                    tooltip = 'INFORMATIONBAR.SITES';
                    break;
                }
            case AeInformationBarItemType.EmployeesCount:
                {
                    tooltip = 'INFORMATIONBAR.EMPLOYEES';
                    break;
                }
            case AeInformationBarItemType.DocumentsCount:
                {
                    tooltip = 'INFORMATIONBAR.DOCUMENTS';
                    break;
                }
            case AeInformationBarItemType.RiskAssessmentCount:
                {
                    tooltip = 'INFORMATIONBAR.RISKASSESSMENTS';
                    break;
                }
            case AeInformationBarItemType.UsersCount:
                {
                    tooltip = 'INFORMATIONBAR.USERS';
                    break;
                }
            case AeInformationBarItemType.ActiveRiskAssessments:
                {
                    if (count === 0) {
                        tooltip = 'RISKASSESSMENTS_INFORMATIONBAR.ACTIVE_RISK_ASSESSMENTS_ZERO_TOOLTIP';
                    }
                    else {
                        tooltip = 'RISKASSESSMENTS_INFORMATIONBAR.ACTIVE_RISK_ASSESSMENTS_TOOLTIP';
                    }
                    break;
                }
            case AeInformationBarItemType.ActiveCOSHHRiskAssessments:
                {
                    if (count === 0) {
                        tooltip = 'RISKASSESSMENTS_INFORMATIONBAR.ACTIVE_COSSH_RISK_ASSESSMENTS_ZERO_TOOLTIP';
                    }
                    else {
                        tooltip = 'RISKASSESSMENTS_INFORMATIONBAR.ACTIVE_COSSH_RISK_ASSESSMENTS_TOOLTIP';
                    }
                    break;
                }
            case AeInformationBarItemType.OverdueRiskAssessments:
                {
                    if (count === 0) {
                        tooltip = 'RISKASSESSMENTS_INFORMATIONBAR.OVERDUE_UPTO_DATE_TOOLTIP';
                    }
                    else {
                        tooltip = 'RISKASSESSMENTS_INFORMATIONBAR.OVERDUE_RISKASSESSMENTS_TOOLTIP';
                    }
                    break;
                }
            case AeInformationBarItemType.OutstandingAssessmentsActions:
                {
                    if (count === 0) {
                        tooltip = 'RISKASSESSMENTS_INFORMATIONBAR.OUTSTANDING_RISKASSESSMENTS_UPTO_DATE_TOOLTIP';
                    }
                    else {
                        tooltip = 'RISKASSESSMENTS_INFORMATIONBAR.OUTSTANDING_RISKASSESSMENTS_TOOLTIP';
                    }
                    break;
                }
            case AeInformationBarItemType.ExampleRiskAssessments:
                {
                    if (count === 0) {
                        tooltip = 'RISKASSESSMENTS_INFORMATIONBAR.EXAMPLES_RISKASSESSMENTS_ZERO_TOOLTIP';
                    }
                    else {
                        tooltip = 'RISKASSESSMENTS_INFORMATIONBAR.EXAMPLES_RISKASSESSMENTS_TOOLTIP';
                    }
                    break;
                }
            default:
                break;
        }
        return tooltip;
    }
}
