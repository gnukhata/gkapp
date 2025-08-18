const tourSteps = [
  'welcomeToDashboard',
  'quickActions',
  'orgLogo',
  'orgAddress',
  'orgTaxMode',
  'orgProfileSubmit',
  'businessItemType',
  'businessItemTax',
  'businessItemGodown',
  'businessItemSubmit',
  'transactionParty',
  'transactionBusinessItem',
  'transactionCash',
  'invoiceSubmit',
];

export default {
  namespaced: true,
  state: {
    showTour: false,
    currentStep: tourSteps[0],
    isLastStep: false,
  },
  mutations: {
    goToNextStep(state) {
      const { currentStep } = state;
      if (!currentStep) {
        state.showTour = false;
        state.isLastStep = false;
        return;
      }
      const currentStepIndex = tourSteps.findIndex((step) => step === currentStep);
      if (currentStepIndex < tourSteps.length - 1) {
        state.currentStep = tourSteps[currentStepIndex + 1];
        if (currentStepIndex === tourSteps.length - 2) {
          state.isLastStep = true;
        }
      } else {
        state.currentStep = null;
      }
    },
    skipTour(state) {
      state.currentStep = null;
      state.showTour = false;
    },
    enableTour(state) {
      state.showTour = true;
    },
  },
};
