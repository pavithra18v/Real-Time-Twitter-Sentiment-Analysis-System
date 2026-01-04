import shap
import numpy as np

class ShapExplainer:
    def __init__(self, model, masker):
        """
        model: function that takes a list of strings and returns prediction probabilities
        masker: shap masker (e.g. shap.maskers.Text)
        """
        self.explainer = shap.Explainer(model, masker)

    def explain(self, texts):
        shap_values = self.explainer(texts)
        return shap_values
    
    def get_feature_importance(self, shap_values):
        # Summarize the effects of all the features
        return np.abs(shap_values.values).mean(0)
