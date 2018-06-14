import { Constructor } from 'make-error';

export class AeWizardStep {

  /**
   * Title of Wizard Step
   * 
   * @type {string}
   * @memberof AeWizardStep
   */
  title: string;

  /**
   * Short description of Wizard step
   * 
   * @type {string}
   * @memberof AeWizardStep
   */
  description: string;

  /**
   * Hidden flag will hide the step from the list of steps. Useful when we need to hide a step dynamically based on a user action
   * 
   * @type {boolean}
   * @memberof AeWizardStep
   */
  hidden: boolean;

  /**
   * Current active step. Styles will be applied accordingly
   * 
   * @type {boolean}
   * @memberof AeWizardStep
   */
  isActive: boolean;

  /**
   * Template type. Template loader will load appropriate template for a step based on this property
   * 
   * @type {string}
   * @memberof AeWizardStep
   */
  templateType: string;

  /**
   * Specifies that the step is always valid and hence Next button should be active by default.
   * 
   * @type {boolean}
   * @memberof AeWizardStep
   */
  isAlwaysValid: boolean;
  waitOnSubmit: boolean;
  submitOnPrevious: boolean;
  submitOnStepChange: boolean;
  constructor(title: string
    , description: string
    , templateType: string
    , isAlwaysValid: boolean = false
    , isActive: boolean = false
    , hidden: boolean = false
    , waitOnSubmit: boolean = false
    , submitOnPrevious: boolean = false
    , submitOnStepChange: boolean = true) {
    this.title = title;
    this.description = description;
    this.hidden = hidden;
    this.isActive = isActive;
    this.templateType = templateType;
    this.isAlwaysValid = isAlwaysValid;
    this.waitOnSubmit = waitOnSubmit;
    this.submitOnPrevious = submitOnPrevious;
    this.submitOnStepChange = submitOnStepChange;
  }
}