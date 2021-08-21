const RegisterSteps = {
  Install: 0,
  Register: 1,
  ChooseLanguages: 2,
  ChoosePages: 3,

  next: (currentStep: number) => currentStep < RegisterSteps.ChoosePages ? currentStep + 1 : currentStep,
  prev: (currentStep: number) => currentStep > RegisterSteps.Install ? currentStep - 1 : currentStep,
}

export default RegisterSteps