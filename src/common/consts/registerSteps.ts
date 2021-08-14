const RegisterSteps = {
  Install: 0,
  Register: 1,
  ChooseMasteredLanguages: 2,
  ChooseLearningLanguages: 3,
  ChoosePage: 4,

  next: (currentStep: number) => currentStep + 1,
}

export default RegisterSteps