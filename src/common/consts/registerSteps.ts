const RegisterSteps = {
  Install: 0,
  Register: 1,
  ChooseLanguages: 2,

  next: (currentStep: number): number => currentStep < RegisterSteps.ChooseLanguages ? currentStep + 1 : RegisterSteps.ChooseLanguages,
  prev: (currentStep: number): number => currentStep > RegisterSteps.Install ? currentStep - 1 : currentStep,
}

export default RegisterSteps
