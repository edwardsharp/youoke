# YOUOKE.party :microphone:

## Download

{% if site.github.latest_release %}

### Latest release: {{ site.github.latest_release.tag_name }} ({{ site.github.latest_release.published_at | date_to_string }})

{% for asset in site.github.latest_release.assets %}
  * [:arrow_down: {{ asset.name }}]({{ asset.browser_download_url }})  
{% endfor %}
{% endif %}

### All Releases

{% for release in site.github.releases %}
  * {{release.tag_name}} ({{ release.published_at | date_to_string }})  
    {%- for asset in release.assets %}  
    [{{ asset.name }}]({{ asset.browser_download_url }})
    {%- endfor %}
{% endfor %}

___

{% include_relative README.md %}
