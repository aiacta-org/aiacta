from setuptools import setup, find_packages
setup(
    name='ai-citation-sdk',
    version='1.0.0',
    description='AIACTA Citation Webhook SDK for Python (Proposal 2 §3.4)',
    packages=find_packages(),
    python_requires='>=3.9',
    install_requires=['cryptography>=41.0', 'requests>=2.31'],
)
