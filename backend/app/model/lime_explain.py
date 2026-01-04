from lime.lime_text import LimeTextExplainer
from sklearn.pipeline import make_pipeline

class LimeExplainer:
    def __init__(self, class_names=['Negative', 'Positive']):
        self.explainer = LimeTextExplainer(class_names=class_names)

    def explain(self, text, predict_proba_fn, num_features=10):
        """
        Generates LIME explanation for a single text instance.
        predict_proba_fn: A function that takes a list of texts and returns a probability matrix.
        """
        exp = self.explainer.explain_instance(text, predict_proba_fn, num_features=num_features)
        return exp.as_list()
